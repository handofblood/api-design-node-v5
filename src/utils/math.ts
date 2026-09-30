export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFromArr(arr: string[]): string {
    const size = arr.length - 1
    const randIndex = getRandomInt(0, size)
    return arr[randIndex].toLowerCase()
}