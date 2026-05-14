def lis(nums):
    dp = [1] * len(nums)
    result = 1
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
        result = max(result, dp[i])
    return result

nums = [3, 1, 4, 1, 5, 9, 2, 6]
answer = lis(nums)
