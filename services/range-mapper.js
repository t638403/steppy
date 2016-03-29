module.exports = RangeMapperService;

function RangeMapper(fromStart, fromEnd, toStart, toEnd) {
    this.map = function map(s) {
        return ( toStart + ( (s - fromStart) * (toEnd - toStart) / (fromEnd - fromStart) ) );
    }
    this.pam = function pam(t) {
        return ( t + ( (t - toStart) * (fromEnd - t) / (toEnd - toStart) ) );
    }
}

function RangeMapperService(application) {

    return {
        create:function(fromStart, fromEnd, toStart, toEnd) {
            var rm = new RangeMapper(fromStart, fromEnd, toStart, toEnd);
            return rm.map;
        }
    }

}
