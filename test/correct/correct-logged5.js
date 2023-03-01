function aFunction(A) {
  console.log(`Entering aFunction(${ A }) at line 1`);
  function bFunction(B) {
    console.log(`Entering bFunction(${ B }) at line 2`);
    function cFunction(C) {
      console.log(`Entering cFunction(${ C }) at line 3`);
      const dFunction = function(D) {
        console.log(`Entering <anonymous function>(${ D }) at line 4`);
        (E => {
          console.log(`Entering <anonymous function>(${ E }) at line 5`);
        })(5); 
      };
      dFunction(4);
    }
    cFunction(3);
  }
  bFunction(2);
}
aFunction(1);