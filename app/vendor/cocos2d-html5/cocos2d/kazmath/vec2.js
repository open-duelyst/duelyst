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

cc.kmVec2 = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

cc.kmVec2Fill = function (pOut, x, y) {
    pOut.x = x;
    pOut.y = y;
    return pOut;
};

cc.kmVec2Length = function (pIn) {
    return Math.sqrt(cc.kmSQR(pIn.x) + cc.kmSQR(pIn.y));
};

cc.kmVec2LengthSq = function (pIn) {
    return cc.kmSQR(pIn.x) + cc.kmSQR(pIn.y);
};

cc.kmVec2Normalize = function (pOut, pIn) {
    var l = 1.0 / cc.kmVec2Length(pIn);

    var v = new cc.kmVec2();
    v.x = pIn.x * l;
    v.y = pIn.y * l;

    pOut.x = v.x;
    pOut.y = v.y;

    return pOut;
};

cc.kmVec2Add = function (pOut, pV1, pV2) {
    pOut.x = pV1.x + pV2.x;
    pOut.y = pV1.y + pV2.y;

    return pOut
};

cc.kmVec2Dot = function (pV1, pV2) {
    return pV1.x * pV2.x + pV1.y * pV2.y;
};

cc.kmVec2Subtract = function (pOut, pV1, pV2) {
    pOut.x = pV1.x - pV2.x;
    pOut.y = pV1.y - pV2.y;

    return pOut;
};

cc.kmVec2Transform = function (pOut, pV, pM) {
    var v= new cc.kmVec2();

    v.x = pV.x * pM.mat[0] + pV.y * pM.mat[3] + pM.mat[6];
    v.y = pV.x * pM.mat[1] + pV.y * pM.mat[4] + pM.mat[7];

    pOut.x = v.x;
    pOut.y = v.y;

    return pOut;
};

cc.kmVec2TransformCoord = function (pOut, pV, pM) {
    return null;
};

cc.kmVec2Scale = function (pOut, pIn, s) {
    pOut.x = pIn.x * s;
    pOut.y = pIn.y * s;

    return pOut;
};

cc.kmVec2AreEqual = function (p1, p2) {
    return (
        (p1.x < p2.x + cc.kmEpsilon && p1.x > p2.x - cc.kmEpsilon) &&
            (p1.y < p2.y + cc.kmEpsilon && p1.y > p2.y - cc.kmEpsilon)
        );
};
