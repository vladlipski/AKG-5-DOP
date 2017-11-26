var SoftEngine;
(function (SoftEngine) {
    SoftEngine.enableDottedLine = true;

  var Camera = (function () {
    function Camera() {
      this.Position = HELPER.Vector3.Zero();
      this.Target = HELPER.Vector3.Zero();
      this.Phi = 0.001;
      this.Etha = 0.001;
      this.Radius = 100;
    }

    return Camera;
  })();
  SoftEngine.Camera = Camera;
  var Mesh = (function () {
    function Mesh(name, verticesCount, facesCount) {
      this.name = name;
      this.Vertices = new Array(verticesCount);
      this.Faces = new Array(facesCount);
      this.Rotation = new HELPER.Vector3(0.001, 0.001, 0.001);
      this.Position = new HELPER.Vector3(0, 0, 0);
    }

    return Mesh;
  })();
  SoftEngine.Mesh = Mesh;
  var Axis = (function () {
    function Axis() {
      this.FirstPoint = new HELPER.Vector3(0, 0, 0);
      this.SecondPoint = new HELPER.Vector3(0, 0, 0);
      this.angle = 0;
    }

    return Axis;
  })();
  SoftEngine.Axis = Axis;
  var Device = (function () {
    function Device(canvas) {
      this.workingCanvas = canvas;
      this.workingWidth = canvas.width;
      this.workingHeight = canvas.height;
      this.workingContext = this.workingCanvas.getContext("2d");
      this.depthbuffer = new Array(this.workingWidth * this.workingHeight);
    }

    Device.prototype.clear = function () {
      this.workingContext.clearRect(0, 0, this.workingWidth, this.workingHeight);
      this.backbuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight);
      for (var i = 0; i < this.depthbuffer.length; i++) {
        this.depthbuffer[i] = 10000000;
      }
    };
    Device.prototype.present = function () {
      this.workingContext.putImageData(this.backbuffer, 0, 0);
    };
    Device.prototype.putInfo = function (camera) {
      // this.workingContext.font = "15px Arial";
      // this.workingContext.fillStyle = "red";
      // this.workingContext.fillText("Radius: " + camera.Radius,10,20);
      //
      // this.workingContext.fillText("Phi: " + camera.Phi*180/Math.PI,10,40);
      //
      // this.workingContext.fillText("Etha: " + camera.Etha*180/Math.PI,10,60);
    };
    Device.prototype.putPixel = function (x, y, z, color, forceDraw) {
      this.backbufferdata = this.backbuffer.data;
      var index = ((x >> 0) + (y >> 0) * this.workingWidth);
      var index4 = index * 4;
      if (!forceDraw && this.depthbuffer[index] < z) {
        return;
      }
      //if(this.depthbuffer[index] >= z) {
      //     this.depthbuffer[index] = z;
      //}
      this.backbufferdata[index4] = color.r * 255;
      this.backbufferdata[index4 + 1] = color.g * 255;
      this.backbufferdata[index4 + 2] = color.b * 255;
      this.backbufferdata[index4 + 3] = color.a * 255;
    };

    Device.prototype.project = function (coord, transMat, camera) {
      var point = HELPER.Vector3.TransformCoordinates(coord, transMat);
      var x = point.x * this.workingWidth + this.workingWidth / 2.0;
      var y = -point.y * this.workingHeight + this.workingHeight / 2.0;
      var z = Math.sqrt(Math.pow(coord.x - camera.Position.x, 2) + Math.pow(coord.y - camera.Position.y, 2) + Math.pow(coord.z - camera.Position.z, 2));
      return (new HELPER.Vector3(x, y, point.z));
    };
    Device.prototype.drawPoint = function (point, color, forceDraw) {
      if (point.x >= 0 && point.y >= 0 && point.x < this.workingWidth && point.y < this.workingHeight) {
        this.putPixel(point.x, point.y, point.z, color, forceDraw);
      }
    };

    Device.prototype.dephPoint = function (point, color) {
      if (point.x >= 0 && point.y >= 0 && point.x < this.workingWidth && point.y < this.workingHeight) {
        this.backbufferdata = this.backbuffer.data;
        var index = ((point.x >> 0) + (point.y >> 0) * this.workingWidth);
        var index4 = index * 4;
        if (this.depthbuffer[index] < point.z) {
          return;
        }
        this.depthbuffer[index] = point.z;

        this.backbufferdata[index4] = color.r * 255;
        this.backbufferdata[index4 + 1] = color.g * 255;
        this.backbufferdata[index4 + 2] = color.b * 255;
        this.backbufferdata[index4 + 3] = color.a * 255;
      }
    };

    Device.prototype.clamp = function (value, min, max) {
      if (typeof min === "undefined") {
        min = 0;
      }
      if (typeof max === "undefined") {
        max = 1;
      }
      return Math.max(min, Math.min(value, max));
    };
    Device.prototype.interpolate = function (min, max, gradient) {
      return min + (max - min) * this.clamp(gradient);
    };

    Device.prototype.processScanLine = function (y, pa, pb, pc, pd, color) {
      var gradient1 = pa.y != pb.y ? (y - pa.y) / (pb.y - pa.y) : 1;
      var gradient2 = pc.y != pd.y ? (y - pc.y) / (pd.y - pc.y) : 1;
      var sx = this.interpolate(pa.x, pb.x, gradient1) >> 0;
      var ex = this.interpolate(pc.x, pd.x, gradient2) >> 0;
      var z1 = this.interpolate(pa.z, pb.z, gradient1);
      var z2 = this.interpolate(pc.z, pd.z, gradient2);
      for (var x = sx; x < ex; x++) {
        var gradient = (x - sx) / (ex - sx);
        var z = this.interpolate(z1, z2, gradient);
        this.dephPoint(new HELPER.Vector3(x, y, z), color);
      }
    };

    Device.prototype.drawTriangle = function (p1, p2, p3, color) {
      if (p1.y > p2.y) {
        var temp = p2;
        p2 = p1;
        p1 = temp;
      }
      if (p2.y > p3.y) {
        var temp = p2;
        p2 = p3;
        p3 = temp;
      }
      if (p1.y > p2.y) {
        var temp = p2;
        p2 = p1;
        p1 = temp;
      }
      var dP1P2;
      var dP1P3;
      if (p2.y - p1.y > 0) {
        dP1P2 = (p2.x - p1.x) / (p2.y - p1.y);
      } else {
        dP1P2 = 0;
      }
      if (p3.y - p1.y > 0) {
        dP1P3 = (p3.x - p1.x) / (p3.y - p1.y);
      } else {
        dP1P3 = 0;
      }
      if (dP1P2 > dP1P3) {
        for (var y = p1.y >> 0; y <= p3.y >> 0; y++) {
          if (y < p2.y) {
            this.processScanLine(y, p1, p3, p1, p2, color);
          } else {
            this.processScanLine(y, p1, p3, p2, p3, color);
          }
        }
      } else {
        for (var y = p1.y >> 0; y <= p3.y >> 0; y++) {
          if (y < p2.y) {
            this.processScanLine(y, p1, p2, p1, p3, color);
          } else {
            this.processScanLine(y, p2, p3, p1, p3, color);
          }
        }
      }
    };


    Device.prototype.drawBline = function (point0, point1, color, force) {
      var x0 = point0.x >> 0;
      var y0 = point0.y >> 0;
      var z0 = point0.z;
      var x1 = point1.x >> 0;
      var y1 = point1.y >> 0;
      var z1 = point1.z;
      var dx = Math.abs(x1 - x0);
      var dy = Math.abs(y1 - y0);
      var sx = (x0 < x1) ? 1 : -1;
      var sy = (y0 < y1) ? 1 : -1;
      var err = dx - dy;
      var zCh = Math.abs(z1 - z0) / Math.sqrt(dx * dx + dy * dy);
      var sz = (z0 < z1) ? 1 : -1;
      var n = 0;
      while (true) {
        var dzx = Math.abs((point0.x >> 0) - x0);
        var dzy = Math.abs((point0.y >> 0) - y0);
        var z = z0 + sz * zCh * Math.sqrt(dzx * dzx + dzy * dzy);
          if(SoftEngine.enableDottedLine){
              this.drawPoint(new HELPER.Vector3(x0, y0, z), color, ((n % 20) > 10) || force);
          }
          else {
              this.drawPoint(new HELPER.Vector3(x0, y0, z), color, ((n % 1) > 10) || force);
          }
        n++;
        if ((x0 == x1) && (y0 == y1)) {
          break;
        }
        var e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          x0 += sx;
        }
        if (e2 < dx) {
          err += dx;
          y0 += sy;
        }
      }
    };
    Device.prototype.render = function (camera, meshes, axis) {
      var viewMatrix = HELPER.Matrix.LookAtLH(camera.Position, camera.Target, HELPER.Vector3.Up());
      var projectionMatrix = HELPER.Matrix.PerspectiveFovLH(0.78, this.workingWidth / this.workingHeight, 1.0, 100.0);
      for (var index = 0; index < meshes.length; index++) {
        var cMesh = meshes[index];

        var transformPointMatrix = HELPER.Matrix.RotationYawPitchRoll(cMesh.Rotation.y, cMesh.Rotation.x, cMesh.Rotation.z)
          .multiply(HELPER.Matrix.Translation(axis.FirstPoint.x, axis.FirstPoint.y, axis.FirstPoint.z));


        var firstPoint = HELPER.Vector3.TransformCoordinates(axis.FirstPoint, transformPointMatrix);
        var secondPoint = HELPER.Vector3.TransformCoordinates(axis.SecondPoint, transformPointMatrix);

        var worldMatrix = HELPER.Matrix.RotationYawPitchRoll(cMesh.Rotation.y, cMesh.Rotation.x, cMesh.Rotation.z)
          .multiply(HELPER.Matrix.Translation(firstPoint.x, firstPoint.y, firstPoint.z))
          .multiply(HELPER.Matrix.RotationAxis(new HELPER.Vector3(secondPoint.x - firstPoint.x, secondPoint.y - firstPoint.y, secondPoint.z - firstPoint.z), axis.angle))
          .multiply(HELPER.Matrix.Translation(-firstPoint.x, -firstPoint.y, -firstPoint.z))
          .multiply(HELPER.Matrix.Translation(cMesh.Position.x, cMesh.Position.y, cMesh.Position.z));
        var transformMatrix = worldMatrix.multiply(viewMatrix).multiply(projectionMatrix);

        var worldMatrix1 = HELPER.Matrix.RotationYawPitchRoll(cMesh.Rotation.y, cMesh.Rotation.x, cMesh.Rotation.z)
          .multiply(HELPER.Matrix.Translation(cMesh.Position.x, cMesh.Position.y, cMesh.Position.z));
        var transformMatrix1 = viewMatrix.multiply(projectionMatrix);
        for (var indexFaces = 0; indexFaces < cMesh.Faces.length; indexFaces++) {
          var currentFace = cMesh.Faces[indexFaces];
          var vertexA = cMesh.Vertices[currentFace.A];
          var vertexB = cMesh.Vertices[currentFace.B];
          var vertexC = cMesh.Vertices[currentFace.C];
          var vertexD = cMesh.Vertices[currentFace.D];
          var pixelA = this.project(vertexA, transformMatrix, camera);
          var pixelB = this.project(vertexB, transformMatrix, camera);
          var pixelC = this.project(vertexC, transformMatrix, camera);
          var pixelD = this.project(vertexD, transformMatrix, camera);

          // var kForColor = (indexFaces / 6) >> 0;
          // var color = 0.05 + (indexFaces / 6) * 0.25;
          // var colorRGBA;
          // if (kForColor == 0) {
          //   colorRGBA = new HELPER.Color4(1, 1, color, 1)
          // } else if (kForColor == 1) {
          //   colorRGBA = new HELPER.Color4(1, color, 1, 1)
          // } else {
          //   colorRGBA = new HELPER.Color4(color, 1, 1, 1)
          // }


          //this.dephRect(vertexA, pixelA, vertexB, pixelB, vertexC, pixelC, vertexD, pixelD, colorRGBA);
          this.drawTriangle(pixelA, pixelB, pixelC,  currentFace.color);
          this.drawTriangle(pixelC, pixelD, pixelA,  currentFace.color);

          var colorRGBA = new HELPER.Color4(0, 0, 0, 1);

          this.drawBline(pixelA, pixelB, colorRGBA);
          this.drawBline(pixelB, pixelC, colorRGBA);
          this.drawBline(pixelC, pixelD, colorRGBA);
          this.drawBline(pixelD, pixelA, colorRGBA);
        }
        
        if (index === 0) {
            var pixelFirstPoint = this.project(axis.FirstPoint, transformMatrix, camera);
            var pixelSecondPoint = this.project(axis.SecondPoint, transformMatrix, camera);
            this.drawBline(pixelFirstPoint, pixelSecondPoint, new HELPER.Color4(1, 0, 0, 1));
        }
      }
    };
    return Device;
  })();
  SoftEngine.Device = Device;
})(SoftEngine || (SoftEngine = {}));
