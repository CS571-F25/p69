"""
Test tier-specific GRU models.

For each tier, loads the training sequences and the saved .pt model,
then checks: at each point in a run, is the actual next trick in the
model's top-5 predictions?
"""

import json, torch, torch.nn as nn

SEQ_LEN = 30
EMBED_DIM = 64
HIDDEN_DIM = 128
NUM_LAYERS = 1

TIERS = {
    "0_1k": "sequences_0_1k.json",
    "1k_2k": "sequences_1k_2k.json",
    "2k_7k": "sequences_2k_7k.json",
    "7k_plus": "sequences_7k_plus.json",
}


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


def test_tier(tier_name, seq_file):
    print(f"\n{'=' * 60}")
    print(f"  TIER: {tier_name}")
    print(f"{'=' * 60}")

    # Load sequences
    with open(seq_file) as f:
        sequences = json.load(f)["sequences"]

    # Load saved model checkpoint
    checkpoint = torch.load(f"tricks_gru_{tier_name}.pt", map_location="cpu", weights_only=False)
    stoi = checkpoint["stoi"]
    itos = checkpoint["itos"]
    vocab_size = len(stoi)

    model = TrickGRU(vocab_size, EMBED_DIM, HIDDEN_DIM, NUM_LAYERS)
    model.load_state_dict(checkpoint["model_state"])
    model.eval()

    # Test: for each sequence, at each position, is the next trick in top 5?
    top1_hits = 0
    top3_hits = 0
    top5_hits = 0
    total_predictions = 0
    skipped_oov = 0  # tricks not in this tier's vocab

    for seq in sequences:
        # Convert to IDs, skipping unknown tricks
        ids = []
        for t in seq:
            if t in stoi:
                ids.append(stoi[t])
            else:
                skipped_oov += 1
                ids.append(None)

        # For each position j, use history [0..j-1] to predict seq[j]
        for j in range(1, len(seq)):
            # Build the input history (only valid IDs up to position j)
            history = [ids[i] for i in range(j) if ids[i] is not None]
            if len(history) == 0:
                continue

            target_id = ids[j]
            if target_id is None:
                continue  # can't evaluate OOV target

            # Left-pad to SEQ_LEN
            if len(history) <= SEQ_LEN:
                padded = [0] * (SEQ_LEN - len(history)) + history
            else:
                padded = history[-SEQ_LEN:]

            x = torch.tensor([padded], dtype=torch.long)
            with torch.no_grad():
                logits = model(x)

            top5_ids = torch.topk(logits, 5, dim=1).indices[0].tolist()
            top3_ids = top5_ids[:3]
            top1_id = top5_ids[0]

            total_predictions += 1
            if target_id == top1_id:
                top1_hits += 1
            if target_id in top3_ids:
                top3_hits += 1
            if target_id in top5_ids:
                top5_hits += 1

    print(f"  Sequences: {len(sequences)}")
    print(f"  Vocab size: {vocab_size}")
    print(f"  Total prediction points: {total_predictions}")
    print(f"  OOV tokens skipped: {skipped_oov}")
    print()
    if total_predictions > 0:
        print(f"  Top-1 accuracy: {top1_hits}/{total_predictions} = {top1_hits/total_predictions:.1%}")
        print(f"  Top-3 accuracy: {top3_hits}/{total_predictions} = {top3_hits/total_predictions:.1%}")
        print(f"  Top-5 accuracy: {top5_hits}/{total_predictions} = {top5_hits/total_predictions:.1%}")
    else:
        print("  No valid predictions to evaluate.")


if __name__ == "__main__":
    for tier_name, seq_file in TIERS.items():
        test_tier(tier_name, seq_file)
    print(f"\n{'=' * 60}")
    print("  Done!")
    print(f"{'=' * 60}")
