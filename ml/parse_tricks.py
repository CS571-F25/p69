import json
from collections import defaultdict

INPUT_FILES = [
    "TrickRunsNationals.txt",
    "TrickRunsRegionals.txt",
    "TrickRunsNationals24.txt",
    "TrickRunsRegionals24.txt"
]

OUTPUT_FILE = "formatted_sequences.json"


def parse_file(path):
    sequences = defaultdict(lambda: defaultdict(list))

    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            parts = line.split("\t")
            if len(parts) < 10:
                parts = line.split()

            # Extract skier + skierID
            skier_name = parts[0]
            skier_id = parts[1]

            # Extract pass number
            pass_num = None
            for token in parts:
                if token.isdigit():
                    pass_num = token
                    break
            if pass_num is None:
                continue

            # Extract trick code
            trick_code = None
            for i in range(len(parts)):
                if parts[i] in ("Credit", "Repeat", "OOC", "Fall", "No", "NoCredit", "No-Credit"):
                    trick_code = parts[i - 1]
                    break

            if trick_code is None:
                continue

            # Skip invalid numeric-only tokens
            if trick_code.isdigit():
                continue

            key = (skier_name, skier_id)
            sequences[key][pass_num].append(trick_code)

    return sequences


def convert_to_list(seq_dict):
    result = []
    for key, passes in seq_dict.items():
        for pass_num in sorted(passes.keys(), key=lambda x: int(x)):
            tricks = passes[pass_num]
            if len(tricks) > 1:
                result.append(tricks)
    return result


def build_vocab(sequences):
    return sorted({t for seq in sequences for t in seq})


if __name__ == "__main__":
    merged = defaultdict(lambda: defaultdict(list))

    # Parse ALL files and merge
    for file in INPUT_FILES:
        print(f"Parsing {file}...")
        file_sequences = parse_file(file)

        # merge results
        for key, passes in file_sequences.items():
            for pass_num, tricks in passes.items():
                merged[key][pass_num].extend(tricks)

    # Convert → list-of-lists
    sequences = convert_to_list(merged)

    vocab = build_vocab(sequences)

    print("\nTOTAL sequences:", len(sequences))
    print("TOTAL vocab size:", len(vocab))
    print("Example sequences:")
    for seq in sequences[:5]:
        print(seq)

    out = {"sequences": sequences, "vocab": vocab}

    with open(OUTPUT_FILE, "w") as f:
        json.dump(out, f, indent=2)

    print("\nSaved merged formatted_sequences.json")
