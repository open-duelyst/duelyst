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

cc.kmVec4 = function (x, y, z, w) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.w = w || 0;
};


cc.kmVec4Fill = function(outVec, x, y ,z, w){
    outVec.x = x;
    outVec.y = y;
    outVec.z = z;
    outVec.w = w;
    return outVec;
};

cc.kmVec4Add = function(outVec, pV1, pV2){
    outVec.x = pV1.x + pV2.x;
    outVec.y = pV1.y + pV2.y;
    outVec.z = pV1.z + pV2.z;
    outVec.w = pV1.w + pV2.w;

    return outVec;
};

cc.kmVec4Dot = function( vec1, vec2){
    return (  vec1.x * vec2.x
        + vec1.y * vec2.y
        + vec1.z * vec2.z
        + vec1.w * vec2.w );
};

cc.kmVec4Length = function(inVec){
    return Math.sqrt(cc.kmSQR(inVec.x) + cc.kmSQR(inVec.y) + cc.kmSQR(inVec.z) + cc.kmSQR(inVec.w));
};

cc.kmVec4LengthSq = function(inVec){
    return cc.kmSQR(inVec.x) + cc.kmSQR(inVec.y) + cc.kmSQR(inVec.z) + cc.kmSQR(inVec.w);
};

cc.kmVec4Lerp = function(outVec, pV1, pV2, t){
    return outVec;
};

cc.kmVec4Normalize = function(outVec, inVec){
    var l = 1.0 / cc.kmVec4Length(inVec);

    outVec.x *= l;
    outVec.y *= l;
    outVec.z *= l;
    outVec.w *= l;

    return outVec;
};

cc.kmVec4Scale = function(outVec, inVec, scale){
    cc.kmVec4Normalize(outVec, inVec);

    outVec.x *= scale;
    outVec.y *= scale;
    outVec.z *= scale;
    outVec.w *= scale;
    return outVec;
};

cc.kmVec4Subtract = function(outVec,vec1, vec2){
    outVec.x = vec1.x - vec2.x;
    outVec.y = vec1.y - vec2.y;
    outVec.z = vec1.z - vec2.z;
    outVec.w = vec1.w - vec2.w;

    return outVec;
};

cc.kmVec4Transform = function(outVec, vec,mat4Obj){
    outVec.x = vec.x * mat4Obj.mat[0] + vec.y * mat4Obj.mat[4] + vec.z * mat4Obj.mat[8] + vec.w * mat4Obj.mat[12];
    outVec.y = vec.x * mat4Obj.mat[1] + vec.y * mat4Obj.mat[5] + vec.z * mat4Obj.mat[9] + vec.w * mat4Obj.mat[13];
    outVec.z = vec.x * mat4Obj.mat[2] + vec.y * mat4Obj.mat[6] + vec.z * mat4Obj.mat[10] + vec.w * mat4Obj.mat[14];
    outVec.w = vec.x * mat4Obj.mat[3] + vec.y * mat4Obj.mat[7] + vec.z * mat4Obj.mat[11] + vec.w * mat4Obj.mat[15];
    return outVec;
};

cc.kmVec4TransformArray = function(outVec,outStride,vecObj,stride,mat4Obj,count){
    var i = 0;
    //Go through all of the vectors
    while (i < count) {
        var currIn = vecObj + (i * stride); //Get a pointer to the current input
        var out = outVec + (i * outStride); //and the current output
        cc.kmVec4Transform(out, currIn, mat4Obj); //Perform transform on it
        ++i;
    }

    return outVec;
};

cc.kmVec4AreEqual = function(vec1,vec2){
    return (
        (vec1.x < vec2.x + cc.kmEpsilon && vec1.x > vec2.x - cc.kmEpsilon) &&
            (vec1.y < vec2.y + cc.kmEpsilon && vec1.y > vec2.y - cc.kmEpsilon) &&
            (vec1.z < vec2.z + cc.kmEpsilon && vec1.z > vec2.z - cc.kmEpsilon) &&
            (vec1.w < vec2.w + cc.kmEpsilon && vec1.w > vec2.w - cc.kmEpsilon)
        );
};

cc.kmVec4Assign = function(destVec, srcVec){
    if(destVec == srcVec){
        cc.log("destVec and srcVec are same object");
        return destVec;
    }

    destVec.x = srcVec.x;
    destVec.y = srcVec.y;
    destVec.z = srcVec.z;
    destVec.w = srcVec.w;

    return destVec;
};

cc.kmVec4ToTypeArray = function(vecValue){
    if(!vecValue)
        return null;

    var tyArr = new Float32Array(4);
    tyArr[0] = vecValue.x;
    tyArr[1] = vecValue.y;
    tyArr[2] = vecValue.z;
    tyArr[3] = vecValue.w;
    return tyArr;
};

