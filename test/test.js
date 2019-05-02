/* jshint node: true, esversion: 6*/

"use strict";

const chai = require("chai");
const expect = chai.expect;
const openevse = require("../lib/openevse");

describe("#openevse", function() {
  it("should get the flags state", function() {
    var evse = openevse.connect("simulator");
    evse.flags((flags) => {
      expect(flags.service_level).to.equal(1);
      expect(flags.diode_check).to.equal(true);
      expect(flags.vent_required).to.equal(true);
      expect(flags.ground_check).to.equal(true);
      expect(flags.stuck_relay_check).to.equal(true);
      expect(flags.auto_service_level).to.equal(false);
      expect(flags.auto_start).to.equal(true);
      expect(flags.serial_debug).to.equal(false);
      expect(flags.lcd_type).to.equal("rgb");
      expect(flags.gfi_self_test).to.equal(true);
      expect(flags.temp_check).to.equal(true);
    });
  });

  it("should return errors", function() {
    var evse = openevse.connect("simulator");
    evse._request(["XX"], function () {
    }).error(function (err) {
      expect(err.type).to.equal("OperationFailed");
    });
  });

  it("should execute commands in sequence", function(done) {
    const iterations = 10;
    var count = 0;
    var evse = openevse.connect("simulator");
    for(var i = 0; i < iterations; i++)
    {
      evse._driver.commandDelay = (iterations - i);
      evse.flags(
        function(exp) {
          return function() {
            expect(count++).to.equal(exp);
            expect(evse.comm_success).to.equal(exp+1);
            if(iterations === count) {
              done();
            }
          };
        } (i)
      );
      expect(evse.comm_sent).to.equal(i+1);
    }
  });
});
