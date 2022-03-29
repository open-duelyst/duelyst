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
 * A struture that represents an axis-aligned
 * bounding box.
 */
cc.kmAABB = function (min, max) {
    /** The max corner of the box */
    this.min = min || new cc.kmVec3();
    /** The min corner of the box */
    this.max = max || new cc.kmVec3();
};

/**
 * Returns KM_TRUE if point is in the specified AABB, returns
 * KM_FALSE otherwise.
 */
cc.kmAABBContainsPoint = function (pPoint, pBox) {
    if (pPoint.x >= pBox.min.x && pPoint.x <= pBox.max.x &&
        pPoint.y >= pBox.min.y && pPoint.y <= pBox.max.y &&
        pPoint.z >= pBox.min.z && pPoint.z <= pBox.max.z) {
        return cc.KM_TRUE;
    }
    return cc.KM_FALSE;
};

/**
 * Assigns pIn to pOut, returns pOut.
 */
cc.kmAABBAssign = function (pOut, pIn) {
    cc.kmVec3Assign(pOut.min, pIn.min);
    cc.kmVec3Assign(pOut.max, pIn.max);
    return pOut;
};

/**
 * Scales pIn by s, stores the resulting AABB in pOut. Returns pOut
 */
cc.kmAABBScale = function (pOut, pIn, s) {
    cc.log("cc.kmAABBScale hasn't been supported.");
};

