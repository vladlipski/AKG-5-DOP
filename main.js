window.requestAnimationFrame = (function () {
   return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         function (callback) {
             window.setTimeout(callback, 1000 / 600);
         };
     })();

var canvas;
var canvas2;
var device;
var device2;
var mesh;
var meshes = [];
var mera;
var mera2;
var axis;
var cubeA = 10;
document.addEventListener("DOMContentLoaded", init, false);
function init() {
    canvas = document.getElementById("frontBuffer");
    //canvas2 = document.getElementById("frontBuffer2");
    mera = new SoftEngine.Camera();
    //mera2 = new SoftEngine.Camera();
    device = new SoftEngine.Device(canvas);
    //device2 = new SoftEngine.Device(canvas2);
    mesh = new SoftEngine.Mesh("Cube", 8, 6);
    meshes.push(mesh);
    mesh.Vertices[0] = new HELPER.Vector3(8, 8, 8);
    mesh.Vertices[1] = new HELPER.Vector3(8, 0, 8);
    mesh.Vertices[2] = new HELPER.Vector3(0, 0, 8);
    mesh.Vertices[3] = new HELPER.Vector3(0, 8, 8);
    mesh.Vertices[4] = new HELPER.Vector3(8, 8, 0);
    mesh.Vertices[5] = new HELPER.Vector3(8, 0, 0);
    mesh.Vertices[6] = new HELPER.Vector3(0, 0, 0);
    mesh.Vertices[7] = new HELPER.Vector3(0, 8, 0);

    mesh.Faces[0] = {
        A: 0,
        B: 1,
        C: 2,
        D: 3,
        color: new HELPER.Color4(Math.random(), Math.random(), Math.random(), 1)
    };
    mesh.Faces[1] = {
        A: 0,
        B: 4,
        C: 7,
        D: 3,
        color: new HELPER.Color4(Math.random(), Math.random(), Math.random(), 1)
    };
    mesh.Faces[2] = {
        A: 3,
        B: 2,
        C: 6,
        D: 7,
        color: new HELPER.Color4(Math.random(), Math.random(), Math.random(), 1)
    };
    mesh.Faces[3] = {
        A: 4,
        B: 5,
        C: 6,
        D: 7,
        color: new HELPER.Color4(Math.random(), Math.random(), Math.random(), 1)
    };
    mesh.Faces[4] = {
        A: 0,
        B: 1,
        C: 5,
        D: 4,
        color: new HELPER.Color4(Math.random(), Math.random(), Math.random(), 1)
    };
    mesh.Faces[5] = {
        A: 1,
        B: 2,
        C: 6,
        D: 5,
        color: new HELPER.Color4(Math.random(), Math.random(), Math.random(), 1)
    };


    mesh2 = new SoftEngine.Mesh("Cube", 8, 6);
    meshes.push(mesh2);

    mesh2.Vertices[0] = new HELPER.Vector3(0, 0, 0);
    mesh2.Vertices[1] = new HELPER.Vector3(cubeA, 0, 0);
    mesh2.Vertices[2] = new HELPER.Vector3(cubeA, -cubeA, 0);
    mesh2.Vertices[3] = new HELPER.Vector3(0, -cubeA, 0);
    mesh2.Vertices[4] = new HELPER.Vector3(0, 0, -cubeA);
    mesh2.Vertices[5] = new HELPER.Vector3(cubeA, 0, -cubeA);
    mesh2.Vertices[6] = new HELPER.Vector3(cubeA, -cubeA, -cubeA);
    mesh2.Vertices[7] = new HELPER.Vector3(0, -cubeA, -cubeA);

    mesh2.Faces[0] = {
        A: 0,
        B: 1,
        C: 2,
        D: 3,
        color: new HELPER.Color4(Math.random(), Math.random(), Math.random(), 1)
    };
    mesh2.Faces[1] = {
        A: 0,
        B: 1,
        C: 5,
        D: 4,
        color: new HELPER.Color4(Math.random(), Math.random(), Math.random(), 1)
    };
    mesh2.Faces[2] = {
        A: 1,
        B: 2,
        C: 6,
        D: 5,
        color: new HELPER.Color4(Math.random(), Math.random(), Math.random(), 1)
    };
    mesh2.Faces[3] = {
        A: 2,
        B: 3,
        C: 7,
        D: 6,
        color: new HELPER.Color4(Math.random(), Math.random(), Math.random(), 1)
    };
    mesh2.Faces[4] = {
        A: 3,
        B: 0,
        C: 4,
        D: 7,
        color: new HELPER.Color4(Math.random(), Math.random(), Math.random(), 1)
    };
    mesh2.Faces[5] = {
        A: 4,
        B: 5,
        C: 6,
        D: 7,
        color: new HELPER.Color4(Math.random(), Math.random(), Math.random(), 1)
    };

    mesh2.Position =  new HELPER.Vector3(30, 0, 0);

    //mera.Position = new HELPER.Vector3(100, 90, 100);
    mera.Target = new HELPER.Vector3(0, 0, 0);
    //mera2.Target = new HELPER.Vector3(0, 0, 0);
    updateCord();

    axis = new SoftEngine.Axis();
    axis.FirstPoint = new HELPER.Vector3(0, 0, 0);
    axis.SecondPoint = new HELPER.Vector3(8, 8, 8);

    //requestAnimationFrame(drawingLoop);
    drawingLoop();

    document.onkeypress = function(event){

        switch (event.key){
            case 'x':
                mesh.Rotation.x = mesh.Rotation.x + 0.05;
                break;
            case 'y':
                mesh.Rotation.y = mesh.Rotation.y + 0.05;
                break;
            case 'z':
                mesh.Rotation.z = mesh.Rotation.z + 0.05;
                break;
            case 'a':
                axis.angle = axis.angle + 0.05;
                break;
            case 'f':
                SoftEngine.enableDottedLine = !SoftEngine.enableDottedLine;
                break;
            case '4':
                var points = [axis.FirstPoint, axis.SecondPoint];
                points = points.map(function (point) {
                    var cDegrees = Math.PI/180;
                    var cosDegrees = Math.cos(cDegrees);
                    var sinDegrees = Math.sin(cDegrees);

                    var y = (point.y * cosDegrees) + (point.z * sinDegrees);
                    var z = (point.y * -sinDegrees) + (point.z * cosDegrees);
                    return new HELPER.Vector3(point.x, y, z);
                });

                axis.FirstPoint = points[0];
                axis.SecondPoint = points[1];
                break;
            case '8':
                points = [axis.FirstPoint, axis.SecondPoint];
                points = points.map(function (point) {
                    var cDegrees = Math.PI/180;
                    var cosDegrees = Math.cos(cDegrees);
                    var sinDegrees = Math.sin(cDegrees);

                    var x = (point.x * cosDegrees) + (point.z * sinDegrees);
                    var z = (point.x * -sinDegrees) + (point.z * cosDegrees);
                    return new HELPER.Vector3(x, point.y, z);
                });

                axis.FirstPoint = points[0];
                axis.SecondPoint = points[1];
                break;
            case '6':
                points = [axis.FirstPoint, axis.SecondPoint];
                points = points.map(function (point) {
                    var cDegrees = Math.PI/180;
                    var cosDegrees = Math.cos(cDegrees);
                    var sinDegrees = Math.sin(cDegrees);

                    var x = (point.x * cosDegrees) + (point.y * sinDegrees);
                    var y = (point.x * -sinDegrees) + (point.y * cosDegrees);
                    return new HELPER.Vector3(x, y, point.z);
                });

                axis.FirstPoint = points[0];
                axis.SecondPoint = points[1];
                break;
        }

        draw();
    };

    // document.getElementById("rangeX").addEventListener("input", function (event) {
    //     mesh.Rotation.x = document.getElementById("rangeX").value / 100;
    //     draw();
    // });
    // document.getElementById("rangeY").addEventListener("input", function (event) {
    //     mesh.Rotation.y = document.getElementById("rangeY").value / 100;
    //     draw();
    // });
    // document.getElementById("rangeZ").addEventListener("input", function (event) {
    //     mesh.Rotation.z = document.getElementById("rangeZ").value / 100;
    //     draw();
    // });
    // document.getElementById("rangeMy").addEventListener("input", function (event) {
    //     axis.angle = document.getElementById("rangeMy").value / 100;
    //     draw();
    // });
    // document.getElementById("buttonOK").addEventListener("click", function (event) {
    //     var x;
    //     x = document.getElementById("fX").value;
    //     y = document.getElementById("fY").value;
    //     z = document.getElementById("fZ").value;
    //     axis.FirstPoint = new HELPER.Vector3(x, y, z);
    //     x = document.getElementById("sX").value;
    //     y = document.getElementById("sY").value;
    //     z = document.getElementById("sZ").value;
    //     axis.SecondPoint = new HELPER.Vector3(x, y, z);
    //     draw();
    // });
    //
    // document.getElementById("rangeRadius").addEventListener("input", function (event) {
    //     mera.Radius = document.getElementById("rangeRadius").value;
    //     updateCord();
    //     draw();
    // });
    // document.getElementById("rangeEtha").addEventListener("input", function (event) {
    //     mera.Etha = document.getElementById("rangeEtha").value / 100;
    //     updateCord();
    //     draw();
    // });
    // document.getElementById("rangePhi").addEventListener("input", function (event) {
    //     mera.Phi = document.getElementById("rangePhi").value / 100;
    //     updateCord();
    //     draw();
    // });
    document.getElementById("rangeRadius").addEventListener("input", function (event) {
        mera.Radius = document.getElementById("rangeRadius").value;
        updateCord();
        draw();
    });
    document.getElementById("rangeEtha").addEventListener("input", function (event) {
        mera.Etha = document.getElementById("rangeEtha").value / 100;
        updateCord();
        draw();
    });
    document.getElementById("rangePhi").addEventListener("input", function (event) {
        mera.Phi = document.getElementById("rangePhi").value / 100;
        updateCord();
        draw();
    });
}

function drawingLoop() {
    //device.clear();
    //  mesh.Rotation.z += 0.01;
  // mesh.Rotation.y += 0.01;
   //mesh.Position.x += 0.01;
    //device.render(mera, meshes, axis);
    //device.present();
    //mera.Etha += 0.01;
    draw();
    requestAnimationFrame(drawingLoop);
}
function updateCord() {
    var x = mera.Radius * Math.sin(mera.Etha) * Math.cos(mera.Phi);
    var y = mera.Radius * Math.sin(mera.Etha) * Math.sin(mera.Phi);
    var z = mera.Radius * Math.cos(mera.Etha);
    mera.Position = new HELPER.Vector3(x, y, z);
    x = mera.Radius * Math.sin(mera.Etha - 0.5) * Math.cos(mera.Phi);
    y = mera.Radius * Math.sin(mera.Etha - 0.5) * Math.sin(mera.Phi);
    z = mera.Radius * Math.cos(mera.Etha - 0.5);
   // mera2.Position = new HELPER.Vector3(x, y, z);
}
var xA = 0;
function draw() {
    device.clear();
    device.render(mera, meshes, axis);
    device.present();
    device.putInfo(mera);

    // device2.clear();
    // device2.render(mera2, meshes, axis);
    // device2.present();


   /* if (xA%2 == 0) {
        device2.clear();
        device2.render(mera, meshes, axis);
        device2.present();
    } else {

        device2.clear();
        device2.render(mera2, meshes, axis);
        device2.present();
    }
    xA ++;*/
}