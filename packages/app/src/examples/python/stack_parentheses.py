stack = []
source = "(()())"

for char in source:
    if char == "(":
        stack.append(char)
    else:
        stack.pop()
