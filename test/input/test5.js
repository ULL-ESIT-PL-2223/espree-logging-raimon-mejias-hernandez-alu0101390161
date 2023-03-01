function aFunction(A) {
  function bFunction(B) {
    function cFunction(C) {
      const dFunction = function(D) {
        (E => {

        })(5); 
      };
      dFunction(4);
    }
    cFunction(3);
  }
  bFunction(2);
}
aFunction(1);