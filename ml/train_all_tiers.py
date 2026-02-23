import json, random, torch, torch.nn as nn, torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader

TIERS = {
    "0_1k": "sequences_0_1k.json",
    "1k_2k": "sequences_1k_2k.json",
    "2k_7k": "sequences_2k_7k.json",
    "7k_plus": "sequences_7k_plus.json",
}
SEQ_LEN = 30
EMBED_DIM = 64
HIDDEN_DIM = 128
NUM_LAYERS = 1
LR = 1e-3
EPOCHS = 30
BATCH_SIZE = 32
VAL_SPLIT = 0.1
DEVICE = torch.device("cpu")


def load_sequences(path):
    with open(path) as f:
        return json.load(f)["sequences"]


def build_vocab(sequences):
    tricks = sorted({t for seq in sequences for t in seq})
    stoi = {t: i for i, t in enumerate(tricks)}
    itos = {i: t for t, i in stoi.items()}
    return tricks, stoi, itos


class NextTrickDataset(Dataset):
    def __init__(self, sequences, stoi, seq_len):
        self.samples = []
        for seq in sequences:
            ids = [stoi[t] for t in seq]
            if len(ids) < 2:
                continue
            if len(ids) < seq_len:
                for j in range(1, len(ids)):
                    history = ids[:j]
                    padding = [0] * (seq_len - len(history))
                    self.samples.append((padding + history, ids[j]))
            else:
                for i in range(len(ids) - seq_len):
                    self.samples.append((ids[i : i + seq_len], ids[i + seq_len]))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        x, y = self.samples[idx]
        return torch.tensor(x, dtype=torch.long), torch.tensor(y, dtype=torch.long)


class TrickGRU(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, num_layers):
        super().__init__()
        self.embed = nn.Embedding(vocab_size, embed_dim)
        self.gru = nn.GRU(embed_dim, hidden_dim, num_layers=num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_dim, vocab_size)

    def forward(self, x):
        emb = self.embed(x)
        out, _ = self.gru(emb)
        return self.fc(out[:, -1, :])


def top_k_accuracy(logits, targets, k=3):
    topk = torch.topk(logits, k, dim=1).indices
    return (topk == targets.unsqueeze(1)).any(dim=1).float().mean().item()


for tier_name, tier_file in TIERS.items():
    print(f"\n{'=' * 60}")
    print(f"  TIER: {tier_name}")
    print(f"{'=' * 60}")

    sequences = load_sequences(tier_file)
    vocab, stoi, itos = build_vocab(sequences)
    vocab_size = len(vocab)
    print(f"Sequences: {len(sequences)}, Vocab: {vocab_size}")

    dataset = NextTrickDataset(sequences, stoi, SEQ_LEN)
    print(f"Training samples: {len(dataset)}")

    indices = list(range(len(dataset)))
    random.shuffle(indices)
    split = int(len(indices) * (1 - VAL_SPLIT))

    train_loader = DataLoader(
        torch.utils.data.Subset(dataset, indices[:split]), batch_size=BATCH_SIZE, shuffle=True
    )
    val_loader = DataLoader(
        torch.utils.data.Subset(dataset, indices[split:]), batch_size=BATCH_SIZE
    )

    model = TrickGRU(vocab_size, EMBED_DIM, HIDDEN_DIM, NUM_LAYERS).to(DEVICE)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LR)

    best_val_loss = float("inf")
    best_epoch = 0
    best_state = None

    for epoch in range(1, EPOCHS + 1):
        model.train()
        tr_loss = tr_correct = tr_t3 = tr_t5 = tr_total = 0
        for x, y in train_loader:
            x, y = x.to(DEVICE), y.to(DEVICE)
            logits = model(x)
            loss = criterion(logits, y)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            tr_loss += loss.item() * x.size(0)
            tr_correct += (logits.argmax(1) == y).sum().item()
            tr_t3 += top_k_accuracy(logits, y, 3) * x.size(0)
            tr_t5 += top_k_accuracy(logits, y, 5) * x.size(0)
            tr_total += x.size(0)

        model.eval()
        va_loss = va_correct = va_t3 = va_t5 = va_total = 0
        with torch.no_grad():
            for x, y in val_loader:
                x, y = x.to(DEVICE), y.to(DEVICE)
                logits = model(x)
                loss = criterion(logits, y)
                va_loss += loss.item() * x.size(0)
                va_correct += (logits.argmax(1) == y).sum().item()
                va_t3 += top_k_accuracy(logits, y, 3) * x.size(0)
                va_t5 += top_k_accuracy(logits, y, 5) * x.size(0)
                va_total += x.size(0)

        vl = va_loss / va_total
        if vl < best_val_loss:
            best_val_loss = vl
            best_epoch = epoch
            best_state = {k: v.clone() for k, v in model.state_dict().items()}

        if epoch % 5 == 0 or epoch == 1:
            print(
                f"  Epoch {epoch:02d} | "
                f"train loss {tr_loss/tr_total:.4f} acc {tr_correct/tr_total:.3f} "
                f"t3 {tr_t3/tr_total:.3f} t5 {tr_t5/tr_total:.3f} | "
                f"val loss {vl:.4f} acc {va_correct/va_total:.3f} "
                f"t3 {va_t3/va_total:.3f} t5 {va_t5/va_total:.3f}"
            )

    model.load_state_dict(best_state)
    print(f"  Best val loss {best_val_loss:.4f} at epoch {best_epoch}")

    # Save .pt
    pt_path = f"tricks_gru_{tier_name}.pt"
    torch.save(
        {
            "model_state": model.state_dict(),
            "stoi": stoi,
            "itos": itos,
            "vocab": vocab,
            "seq_len": SEQ_LEN,
            "tier": tier_name,
        },
        pt_path,
    )

    # Export ONNX
    model.eval()
    dummy = torch.randint(0, len(vocab), (1, SEQ_LEN), dtype=torch.long)
    onnx_path = f"tricks_gru_{tier_name}.onnx"
    torch.onnx.export(
        model,
        dummy,
        onnx_path,
        export_params=True,
        opset_version=17,
        input_names=["input_ids"],
        output_names=["logits"],
        dynamic_axes={"input_ids": {0: "batch_size"}, "logits": {0: "batch_size"}},
    )

    # Export JSONs
    with open(f"stoi_{tier_name}.json", "w") as f:
        json.dump(stoi, f, indent=2)
    with open(f"itos_{tier_name}.json", "w") as f:
        json.dump({str(k): v for k, v in itos.items()}, f, indent=2)
    with open(f"vocab_{tier_name}.json", "w") as f:
        json.dump(vocab, f, indent=2)
    with open(f"metadata_{tier_name}.json", "w") as f:
        json.dump(
            {
                "vocab_size": len(vocab),
                "seq_len": SEQ_LEN,
                "model_type": "GRU",
                "embed_dim": EMBED_DIM,
                "hidden_dim": HIDDEN_DIM,
                "num_layers": NUM_LAYERS,
                "tier": tier_name,
            },
            f,
            indent=2,
        )

    print(f"  Exported: {onnx_path} + JSON files")

print("\nDone! All 4 tier models trained and exported.")
