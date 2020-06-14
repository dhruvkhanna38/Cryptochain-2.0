const cryptoHash = require("./cryptoHash");


describe("cryptoHash()", ()=>{
    it("generates a SHA256 hashed output" , ()=>{
        expect(cryptoHash('Harry Potter')).
        toEqual("f984f4bdcde0465676326e5d329aff6a84d1395c3d606827473764ff43b3feb6");
    });

    it('produces the same hash with input in different order' , ()=>{
        expect(cryptoHash('one' , 'two' , 'three')).
        toEqual(cryptoHash('three', 'one', 'two'));
    });
});