/**
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.
 Copyright (c) 2008, Luke Benstead.
 All rights reserved.

 Redistribution and use in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:

 Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.
 Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided with the distribution.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var Float32Array = Float32Array || Array;

cc.kmMat3 = function () {
    this.mat = new Float32Array([0, 0, 0,
        0, 0, 0,
        0, 0, 0]);
};

cc.kmMat3Fill = function (pOut, pMat) {
    for (var i = 0; i < 9; i++) {
        pOut.mat[i] = pMat;
    }
    return pOut;
};

cc.kmMat3Adjugate = function (pOut, pIn) {
    pOut.mat[0] = pIn.mat[4] * pIn.mat[8] - pIn.mat[5] * pIn.mat[7];
    pOut.mat[1] = pIn.mat[2] * pIn.mat[7] - pIn.mat[1] * pIn.mat[8];
    pOut.mat[2] = pIn.mat[1] * pIn.mat[5] - pIn.mat[2] * pIn.mat[4];
    pOut.mat[3] = pIn.mat[5] * pIn.mat[6] - pIn.mat[3] * pIn.mat[8];
    pOut.mat[4] = pIn.mat[0] * pIn.mat[8] - pIn.mat[2] * pIn.mat[6];
    pOut.mat[5] = pIn.mat[2] * pIn.mat[3] - pIn.mat[0] * pIn.mat[5];
    pOut.mat[6] = pIn.mat[3] * pIn.mat[7] - pIn.mat[4] * pIn.mat[6];

    // XXX: pIn.mat[9] is invalid!
//    pOut.mat[7] = pIn.mat[1] * pIn.mat[6] - pIn.mat[9] * pIn.mat[7];
    pOut.mat[8] = pIn.mat[0] * pIn.mat[4] - pIn.mat[1] * pIn.mat[3];

    return pOut;
};

cc.kmMat3Identity = function (pOut) {
    pOut.mat[1] = pOut.mat[2] = pOut.mat[3] =
        pOut.mat[5] = pOut.mat[6] = pOut.mat[7] = 0;
    pOut.mat[0] = pOut.mat[4] = pOut.mat[8] = 1.0;
    return pOut;
};

cc.kmMat3Inverse = function (pOut, pDeterminate, pM) {
    var detInv;
    var adjugate = new cc.kmMat3();

    if (pDeterminate === 0.0)
        return null;

    detInv = 1.0 / pDeterminate;

    cc.kmMat3Adjugate(adjugate, pM);
    cc.kmMat3ScalarMultiply(pOut, adjugate, detInv);

    return pOut;
};

cc.kmMat3._identity =
    new Float32Array([1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0]);

cc.kmMat3IsIdentity = function (pIn) {
    for (var i = 0; i < 9; i++) {
        if (cc.kmMat3._identity[i] !== pIn.mat[i])
            return false;
    }
    return true;
};

cc.kmMat3Transpose = function (pOut, pIn) {
    var z, x;
    for (z = 0; z < 3; ++z) {
        for (x = 0; x < 3; ++x)
            pOut.mat[(z * 3) + x] = pIn.mat[(x * 3) + z];
    }

    return pOut;
};

cc.kmMat3Determinant = function (pIn) {
    var output;
    /*
     calculating the determinant following the rule of sarus,
     | 0  3  6 | 0  3 |
     m = | 1  4  7 | 1  4 |
     | 2  5  8 | 2  5 |
     now sum up the products of the diagonals going to the right (i.e. 0,4,8)
     and substract the products of the other diagonals (i.e. 2,4,6)
     */

    output = pIn.mat[0] * pIn.mat[4] * pIn.mat[8] + pIn.mat[1] * pIn.mat[5] * pIn.mat[6] + pIn.mat[2] * pIn.mat[3] * pIn.mat[7];
    output -= pIn.mat[2] * pIn.mat[4] * pIn.mat[6] + pIn.mat[0] * pIn.mat[5] * pIn.mat[7] + pIn.mat[1] * pIn.mat[3] * pIn.mat[8];

    return output;
};

cc.kmMat3Multiply = function (pOut, pM1, pM2) {
    var m1 = pM1.mat, m2 = pM2.mat;

    pOut.mat[0] = m1[0] * m2[0] + m1[3] * m2[1] + m1[6] * m2[2];
    pOut.mat[1] = m1[1] * m2[0] + m1[4] * m2[1] + m1[7] * m2[2];
    pOut.mat[2] = m1[2] * m2[0] + m1[5] * m2[1] + m1[8] * m2[2];

    pOut.mat[3] = m1[0] * m2[3] + m1[3] * m2[4] + m1[6] * m2[5];
    pOut.mat[4] = m1[1] * m2[3] + m1[4] * m2[4] + m1[7] * m2[5];
    pOut.mat[5] = m1[2] * m2[3] + m1[5] * m2[4] + m1[8] * m2[5];

    pOut.mat[6] = m1[0] * m2[6] + m1[3] * m2[7] + m1[6] * m2[8];
    pOut.mat[7] = m1[1] * m2[6] + m1[4] * m2[7] + m1[7] * m2[8];
    pOut.mat[8] = m1[2] * m2[6] + m1[5] * m2[7] + m1[8] * m2[8];

    return pOut;
};

cc.kmMat3ScalarMultiply = function (pOut, pM, pFactor) {
    for (var i = 0; i < 9; i++) {
        pOut.mat[i] = pM.mat[i] * pFactor;
    }
    return pOut;
};

cc.kmMat3RotationAxisAngle = function (pOut, axis, radians) {
    var rcos = Math.cos(radians);
    var rsin = Math.sin(radians);

    pOut.mat[0] = rcos + axis.x * axis.x * (1 - rcos);
    pOut.mat[1] = axis.z * rsin + axis.y * axis.x * (1 - rcos);
    pOut.mat[2] = -axis.y * rsin + axis.z * axis.x * (1 - rcos);

    pOut.mat[3] = -axis.z * rsin + axis.x * axis.y * (1 - rcos);
    pOut.mat[4] = rcos + axis.y * axis.y * (1 - rcos);
    pOut.mat[5] = axis.x * rsin + axis.z * axis.y * (1 - rcos);

    pOut.mat[6] = axis.y * rsin + axis.x * axis.z * (1 - rcos);
    pOut.mat[7] = -axis.x * rsin + axis.y * axis.z * (1 - rcos);
    pOut.mat[8] = rcos + axis.z * axis.z * (1 - rcos);

    return pOut;
};

cc.kmMat3Assign = function (pOut, pIn) {
    if(pOut == pIn) {
        cc.log("cc.kmMat3Assign(): pOut equals pIn");
        return pOut;
    }

    for (var i = 0; i < 9; i++)
        pOut.mat[i] = pIn.mat[i];
    return pOut;
};

cc.kmMat3AreEqual = function (pMat1, pMat2) {
    if (pMat1 == pMat2)
        return true;

    for (var i = 0; i < 9; ++i) {
        if (!(pMat1.mat[i] + cc.kmEpsilon > pMat2.mat[i] &&
            pMat1.mat[i] - cc.kmEpsilon < pMat2.mat[i])) {
            return false;
        }
    }

    return true;
};

cc.kmMat3RotationX = function (pOut, radians) {
    /*
     |  1  0       0      |
     M = |  0  cos(A) -sin(A) |
     |  0  sin(A)  cos(A) |

     */

    pOut.mat[0] = 1.0;
    pOut.mat[1] = 0.0;
    pOut.mat[2] = 0.0;

    pOut.mat[3] = 0.0;
    pOut.mat[4] = Math.cos(radians);
    pOut.mat[5] = Math.sin(radians);

    pOut.mat[6] = 0.0;
    pOut.mat[7] = -Math.sin(radians);
    pOut.mat[8] = Math.cos(radians);

    return pOut;
};

cc.kmMat3RotationY = function (pOut, radians) {
    /*
     |  cos(A)  0   sin(A) |
     M = |  0       1   0      |
     | -sin(A)  0   cos(A) |
     */

    pOut.mat[0] = Math.cos(radians);
    pOut.mat[1] = 0.0;
    pOut.mat[2] = -Math.sin(radians);

    pOut.mat[3] = 0.0;
    pOut.mat[4] = 1.0;
    pOut.mat[5] = 0.0;

    pOut.mat[6] = Math.sin(radians);
    pOut.mat[7] = 0.0;
    pOut.mat[8] = Math.cos(radians);

    return pOut;
};

cc.kmMat3RotationZ = function (pOut, radians) {
    /*
     |  cos(A)  -sin(A)   0  |
     M = |  sin(A)   cos(A)   0  |
     |  0        0        1  |
     */
    pOut.mat[0] = Math.cos(radians);
    pOut.mat[1] = -Math.sin(radians);
    pOut.mat[2] = 0.0;

    pOut.mat[3] = Math.sin(radians);
    pOut.mat[4] = Math.cos(radians);
    pOut.mat[5] = 0.0;

    pOut.mat[6] = 0.0;
    pOut.mat[7] = 0.0;
    pOut.mat[8] = 1.0;

    return pOut;
};

cc.kmMat3Rotation = function (pOut, radians) {
    /*
     |  cos(A)  -sin(A)   0  |
     M = |  sin(A)   cos(A)   0  |
     |  0        0        1  |
     */
    pOut.mat[0] = Math.cos(radians);
    pOut.mat[1] = Math.sin(radians);
    pOut.mat[2] = 0.0;

    pOut.mat[3] = -Math.sin(radians);
    pOut.mat[4] = Math.cos(radians);
    pOut.mat[5] = 0.0;

    pOut.mat[6] = 0.0;
    pOut.mat[7] = 0.0;
    pOut.mat[8] = 1.0;
    return pOut;
};

cc.kmMat3Scaling = function (pOut, x, y) {
//    memset(pOut.mat, 0, sizeof(float) * 9);
    cc.kmMat3Identity(pOut);
    pOut.mat[0] = x;
    pOut.mat[4] = y;

    return pOut;
};

cc.kmMat3Translation = function (pOut, x, y) {
//    memset(pOut.mat, 0, sizeof(float) * 9);
    cc.kmMat3Identity(pOut);
    pOut.mat[6] = x;
    pOut.mat[7] = y;
//    pOut.mat[8] = 1.0;

    return pOut;
};

cc.kmMat3RotationQuaternion = function (pOut, pIn) {
    if (!pIn || !pOut)
        return null;

    // First row
    pOut.mat[0] = 1.0 - 2.0 * (pIn.y * pIn.y + pIn.z * pIn.z);
    pOut.mat[1] = 2.0 * (pIn.x * pIn.y - pIn.w * pIn.z);
    pOut.mat[2] = 2.0 * (pIn.x * pIn.z + pIn.w * pIn.y);

    // Second row
    pOut.mat[3] = 2.0 * (pIn.x * pIn.y + pIn.w * pIn.z);
    pOut.mat[4] = 1.0 - 2.0 * (pIn.x * pIn.x + pIn.z * pIn.z);
    pOut.mat[5] = 2.0 * (pIn.y * pIn.z - pIn.w * pIn.x);

    // Third row
    pOut.mat[6] = 2.0 * (pIn.x * pIn.z - pIn.w * pIn.y);
    pOut.mat[7] = 2.0 * (pIn.y * pIn.z + pIn.w * pIn.x);
    pOut.mat[8] = 1.0 - 2.0 * (pIn.x * pIn.x + pIn.y * pIn.y);

    return pOut;
};

cc.kmMat3RotationToAxisAngle = function (pAxis, radians, pIn) {
    /*Surely not this easy?*/
    var temp;
    cc.kmQuaternionRotationMatrix(temp, pIn);
    cc.kmQuaternionToAxisAngle(temp, pAxis, radians);
    return pAxis;
};





