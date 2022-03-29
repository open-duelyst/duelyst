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

/**
 * @ignore
 */
cc.kmScalar = Number;

cc.kmBool = Number;

cc.kmEnum = Number;

cc.KM_FALSE = 0;

cc.KM_TRUE = 1;

cc.kmPI = 3.141592;

cc.kmPIOver180 = 0.017453;

cc.kmPIUnder180 = 57.295779;

cc.kmEpsilon = 1.0 / 64.0;

/**
 * Returns the square of s (e.g. s*s)
 * @param {Number} s
 */
cc.kmSQR = function(s){
    return s*s;
};

cc.kmDegreesToRadians = function(degrees){
    return degrees * cc.kmPIOver180;
};

cc.kmRadiansToDegrees = function(radians){
    return radians * cc.kmPIUnder180;
};

cc.kmMin = function(lhs,rhs){
    return (lhs < rhs)? lhs : rhs;
};

cc.kmMax = function(lhs,rhs){
    return (lhs > rhs)? lhs : rhs;
};

cc.kmAlmostEqual = function(lhs,rhs){
    return (lhs + cc.kmEpsilon > rhs && lhs - cc.kmEpsilon < rhs);
};
