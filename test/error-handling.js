"use strict";
var test = require("tape"),
    handbrakeJs = require("../lib/handbrake-js"),
    mockCp = require("./mock/child_process");

test("error handling: HandbrakeCLI not found", function(t){
    t.plan(1);

    var handbrake = handbrakeJs.spawn(
        { input: "blah", output: "blah" }, 
        { HandbrakeCLIPath: "broken/path" }
    );
    handbrake.on("error", function(err){
        t.deepEqual(err, {
            name: "HandbrakeCLINotFound",
            message: "HandbrakeCLI application not found: broken/path",
            HandbrakeCLIPath: "broken/path",
            errno: "ENOENT",
            spawnmessage: "spawn ENOENT",
            options: { input: "blah", output: "blah" },
            output: ""
        });
    });
});

test("error handling: HandbrakeCLIError", function(t){
    t.plan(1);

    var handbrake = handbrakeJs.spawn({ input: "blah", output: "blah" }, { cp: mockCp });
    handbrake.on("error", function(err){
        t.deepEqual(err, {
            name: "HandbrakeCLIError",
            message: "Handbrake failed with error code: 13",
            errno: 13,
            options: { input: "blah", output: "blah" },
            output: ""
        });
    });

    process.nextTick(function(){
        mockCp.lastHandle.emit("exit", 13);
    });
});

test("error handling: NoTitleFound error", function(t){
    t.plan(1);

    var handbrake = handbrakeJs.spawn({ input: "blah", output: "blah" }, { cp: mockCp });
    handbrake.on("error", function(err){
        t.deepEqual(err, {
            name: "NoTitleFound",
            message: "Encode failed, not a video file",
            options: { input: "blah", output: "blah" },
            output: "blah.No title found.blah."
        });
    });

    process.nextTick(function(){
        mockCp.lastHandle.stdout.emit("data", "blah.");
        mockCp.lastHandle.stdout.emit("data", "No title found.");
        mockCp.lastHandle.stdout.emit("data", "blah.");
        mockCp.lastHandle.emit("exit", 0);
    });
});

test("error handling: SegFault", function(t){
    t.plan(1);

    var handbrake = handbrakeJs.spawn({ input: "blah", output: "blah" }, { cp: mockCp });
    handbrake.on("error", function(err){
        t.deepEqual(err, {
            name: "HandbrakeCLICrash",
            message: "HandbrakeCLI crashed (Segmentation fault)",
            options: { input: "blah", output: "blah" },
            output: ""
        });
    });
    process.nextTick(function(){
        mockCp.lastHandle.emit("exit", null);
    });
});