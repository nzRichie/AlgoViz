counts = {}
values = ["a", "b", "a"]

for value in values:
    counts[value] = counts.get(value, 0) + 1
