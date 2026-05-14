let arr = [5, 1, 4, 2];
let swapped = true;

while (swapped) {
  swapped = false;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) {
      const tmp = arr[i];
      arr[i] = arr[i + 1];
      arr[i + 1] = tmp;
      swapped = true;
    }
  }
}
