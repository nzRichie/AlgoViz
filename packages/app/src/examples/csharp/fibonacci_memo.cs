var memo = new Dictionary<int, int>();
int n = 6;

for (int i = 0; i <= n; i++) {
  memo[i] = i < 2 ? i : memo[i - 1] + memo[i - 2];
}
