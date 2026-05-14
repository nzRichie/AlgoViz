grid = [[1, 2, 3], [4, 5, 6]]
dp = [[0 for _ in row] for row in grid]

for row in range(len(grid)):
    for col in range(len(grid[row])):
        dp[row][col] = grid[row][col]
