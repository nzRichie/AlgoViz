int[] arr = {5, 1, 4, 2};
bool swapped = true;

while (swapped) {
  swapped = false;
  for (int i = 0; i < arr.Length - 1; i++) {
    if (arr[i] > arr[i + 1]) {
      int tmp = arr[i];
      arr[i] = arr[i + 1];
      arr[i + 1] = tmp;
      swapped = true;
    }
  }
}
