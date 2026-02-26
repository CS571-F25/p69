"""
Test tier-specific GRU models on a held-out test set.

For each tier, loads the sequences and the saved .pt model, then splits
sequences 80/20 (train/test) using a fixed seed so results are reproducible.
Evaluation runs only on the 20% test split to approximate generalization.

Note: the models were trained with a random (unseeded) shuffle, so a small
number of "test" sequences may overlap with what the model saw during training.
This is still a much more honest estimate than evaluating on all sequences.
"""

import json, random, torch, torch.nn as nn

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

SEED = 42
TEST_SPLIT = 0.2  # held-out fraction


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

    # Load sequences and split into train/test with fixed seed
    with open(seq_file) as f:
        all_sequences = json.load(f)["sequences"]

    rng = random.Random(SEED)
    indices = list(range(len(all_sequences)))
    rng.shuffle(indices)
    split = int(len(indices) * (1 - TEST_SPLIT))
    test_indices = indices[split:]
    sequences = [all_sequences[i] for i in test_indices]

    print(f"  Total sequences: {len(all_sequences)}  |  Test set: {len(sequences)} ({TEST_SPLIT:.0%} held out)")

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

    # Per-run: did every trick in the run land in top 1/3/5?
    perfect_run_top1 = 0
    perfect_run_top3 = 0
    perfect_run_top5 = 0
    total_runs = 0

    for seq in sequences:
        # Convert to IDs, skipping unknown tricks
        ids = []
        for t in seq:
            if t in stoi:
                ids.append(stoi[t])
            else:
                skipped_oov += 1
                ids.append(None)

        # Skip runs that are too short to evaluate
        evaluable_positions = [(j, ids[j]) for j in range(1, len(seq)) if ids[j] is not None]
        if not evaluable_positions:
            continue

        run_all_top1 = True
        run_all_top3 = True
        run_all_top5 = True

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
            else:
                run_all_top1 = False

            if target_id in top3_ids:
                top3_hits += 1
            else:
                run_all_top3 = False

            if target_id in top5_ids:
                top5_hits += 1
            else:
                run_all_top5 = False

        total_runs += 1
        if run_all_top1:
            perfect_run_top1 += 1
        if run_all_top3:
            perfect_run_top3 += 1
        if run_all_top5:
            perfect_run_top5 += 1

    print(f"  Vocab size: {vocab_size}")
    print(f"  Total prediction points: {total_predictions}")
    print(f"  OOV tokens skipped: {skipped_oov}")
    print()
    if total_predictions > 0:
        print(f"  --- Per-trick accuracy ---")
        print(f"  Top-1 accuracy: {top1_hits}/{total_predictions} = {top1_hits/total_predictions:.1%}")
        print(f"  Top-3 accuracy: {top3_hits}/{total_predictions} = {top3_hits/total_predictions:.1%}")
        print(f"  Top-5 accuracy: {top5_hits}/{total_predictions} = {top5_hits/total_predictions:.1%}")
        print()
        print(f"  --- Perfect run accuracy (all tricks in top N) ---")
        print(f"  Top-1 perfect runs: {perfect_run_top1}/{total_runs} = {perfect_run_top1/total_runs:.1%}")
        print(f"  Top-3 perfect runs: {perfect_run_top3}/{total_runs} = {perfect_run_top3/total_runs:.1%}")
        print(f"  Top-5 perfect runs: {perfect_run_top5}/{total_runs} = {perfect_run_top5/total_runs:.1%}")
    else:
        print("  No valid predictions to evaluate.")


if __name__ == "__main__":
    for tier_name, seq_file in TIERS.items():
        test_tier(tier_name, seq_file)
    print(f"\n{'=' * 60}")
    print("  Done!")
    print(f"{'=' * 60}")
