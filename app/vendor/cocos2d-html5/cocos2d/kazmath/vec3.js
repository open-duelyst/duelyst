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

cc.kmVec3 = function (x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
};

cc.kmVec3Fill = function(pOut, x, y , z){
    if(!pOut)
        return new cc.kmVec3(x, y , z);
    pOut.x = x;
    pOut.y = y;
    pOut.z = z;
    return pOut;
};

cc.kmVec3Length = function(pIn){
    return Math.sqrt(cc.kmSQR(pIn.x) + cc.kmSQR(pIn.y) + cc.kmSQR(pIn.z));
};

cc.kmVec3LengthSq = function(pIn){
    return cc.kmSQR(pIn.x) + cc.kmSQR(pIn.y) + cc.kmSQR(pIn.z)
} ;

cc.kmVec3Normalize = function(pOut,pIn){
    var l = 1.0 / cc.kmVec3Length(pIn);

    pOut.x = pIn.x * l;
    pOut.y = pIn.y * l;
    pOut.z = pIn.z * l;
    return pOut;
};

cc.kmVec3Cross = function(pOut, pV1,pV2){
    pOut.x = (pV1.y * pV2.z) - (pV1.z * pV2.y);
    pOut.y = (pV1.z * pV2.x) - (pV1.x * pV2.z);
    pOut.z = (pV1.x * pV2.y) - (pV1.y * pV2.x);
    return pOut;
};

cc.kmVec3Dot = function(pV1, pV2){
    return (  pV1.x * pV2.x
        + pV1.y * pV2.y
        + pV1.z * pV2.z );
} ;

cc.kmVec3Add = function(pOut, pV1, pV2){
    pOut.x = pV1.x + pV2.x;
    pOut.y = pV1.y + pV2.y;
    pOut.z = pV1.z + pV2.z;
    return pOut;
};

cc.kmVec3Subtract = function(pOut, pV1, pV2){
    pOut.x = pV1.x - pV2.x;
    pOut.y = pV1.y - pV2.y;
    pOut.z = pV1.z - pV2.z;
    return pOut;
};

cc.kmVec3Transform = function(pOut, pV, pM){
    /*
     a = (Vx, Vy, Vz, 1)
     b = (a×M)T
     Out = (bx, by, bz)
     */
    pOut.x = pV.x * pM.mat[0] + pV.y * pM.mat[4] + pV.z * pM.mat[8] + pM.mat[12];
    pOut.y = pV.x * pM.mat[1] + pV.y * pM.mat[5] + pV.z * pM.mat[9] + pM.mat[13];
    pOut.z = pV.x * pM.mat[2] + pV.y * pM.mat[6] + pV.z * pM.mat[10] + pM.mat[14];
    return pOut;
};

cc.kmVec3TransformNormal = function(pOut, pV, pM){
    /*
     a = (Vx, Vy, Vz, 0)
     b = (a×M)T
     Out = (bx, by, bz)
     */
    //Omits the translation, only scaling + rotating
    pOut.x = pV.x * pM.mat[0] + pV.y * pM.mat[4] + pV.z * pM.mat[8];
    pOut.y = pV.x * pM.mat[1] + pV.y * pM.mat[5] + pV.z * pM.mat[9];
    pOut.z = pV.x * pM.mat[2] + pV.y * pM.mat[6] + pV.z * pM.mat[10];
    return pOut;
};

cc.kmVec3TransformCoord = function(pOut,pV,pM){
    /*
     a = (Vx, Vy, Vz, 1)
     b = (a×M)T
     Out = 1⁄bw(bx, by, bz)
     */
    var v = new cc.kmVec4();
    var inV = new cc.kmVec4();
    cc.kmVec4Fill(inV, pV.x, pV.y, pV.z, 1.0);

    cc.kmVec4Transform(v, inV,pM);

    pOut.x = v.x / v.w;
    pOut.y = v.y / v.w;
    pOut.z = v.z / v.w;

    return pOut;
};

cc.kmVec3Scale = function(pOut, pIn, s){
    pOut.x = pIn.x * s;
    pOut.y = pIn.y * s;
    pOut.z = pIn.z * s;

    return pOut;
};

cc.kmVec3AreEqual = function(p1, p2){
    if ((p1.x < (p2.x + cc.kmEpsilon) && p1.x > (p2.x - cc.kmEpsilon)) &&
        (p1.y < (p2.y + cc.kmEpsilon) && p1.y > (p2.y - cc.kmEpsilon)) &&
        (p1.z < (p2.z + cc.kmEpsilon) && p1.z > (p2.z - cc.kmEpsilon))) {
        return 1;
    }

    return 0;
};

cc.kmVec3InverseTransform = function(pOut, pVect,pM){
    var v1 = new cc.kmVec3(pVect.x - pM.mat[12], pVect.y - pM.mat[13],pVect.z - pM.mat[14]);

    pOut.x = v1.x * pM.mat[0] + v1.y * pM.mat[1] + v1.z * pM.mat[2];
    pOut.y = v1.x * pM.mat[4] + v1.y * pM.mat[5] + v1.z * pM.mat[6];
    pOut.z = v1.x * pM.mat[8] + v1.y * pM.mat[9] + v1.z * pM.mat[10];

    return pOut;
};

cc.kmVec3InverseTransformNormal = function(pOut, pVect, pM){
    pOut.x = pVect.x * pM.mat[0] + pVect.y * pM.mat[1] + pVect.z * pM.mat[2];
    pOut.y = pVect.x * pM.mat[4] + pVect.y * pM.mat[5] + pVect.z * pM.mat[6];
    pOut.z = pVect.x * pM.mat[8] + pVect.y * pM.mat[9] + pVect.z * pM.mat[10];

    return pOut;
};

cc.kmVec3Assign = function(pOut,pIn){
    if (pOut == pIn)
        return pOut;

    pOut.x = pIn.x;
    pOut.y = pIn.y;
    pOut.z = pIn.z;
    return pOut;
};

cc.kmVec3Zero = function(pOut){
    pOut.x = 0.0;
    pOut.y = 0.0;
    pOut.z = 0.0;

    return pOut;
};

cc.kmVec3ToTypeArray = function(vecValue){
    if(!vecValue)
        return null;

    var tyArr = new Float32Array(3);
    tyArr[0] = vecValue.x;
    tyArr[1] = vecValue.y;
    tyArr[2] = vecValue.z;
    return tyArr;
};










