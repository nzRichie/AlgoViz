graph = {"A": ["B", "C"], "B": ["D"], "C": [], "D": []}
visited = set()
queue = ["A"]

while queue:
    node = queue.pop(0)
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            queue.append(neighbor)
