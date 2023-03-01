const addSecond = function(seconds) {
  console.log(`Entering addSecond(${ seconds }) at line 1`);
  let spread = false;
  seconds++;
  if (seconds >= 60) {
    seconds = 0;
    spread = true;
  }
  return [seconds, spread];
};
addSecond(1454054)