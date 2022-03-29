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
cc.KM_PLANE_LEFT = 0;

cc.KM_PLANE_RIGHT = 1;

cc.KM_PLANE_BOTTOM = 2;

cc.KM_PLANE_TOP = 3;

cc.KM_PLANE_NEAR = 4;

cc.KM_PLANE_FAR = 5;

cc.kmPlane = function (a, b, c, d) {
    this.a = a || 0;
    this.b = b || 0;
    this.c = c || 0;
    this.d = d || 0;
};

cc.POINT_INFRONT_OF_PLANE = 0;

cc.POINT_BEHIND_PLANE = 1;

cc.POINT_ON_PLANE = 2;

cc.kmPlaneDot = function(pP, pV){
    //a*x + b*y + c*z + d*w
    return (pP.a * pV.x +
        pP.b * pV.y +
        pP.c * pV.z +
        pP.d * pV.w);
};

cc.kmPlaneDotCoord = function(pP, pV){
    return (pP.a * pV.x +
        pP.b * pV.y +
        pP.c * pV.z + pP.d);
};

cc.kmPlaneDotNormal = function(pP, pV){
    return (pP.a * pV.x +
        pP.b * pV.y +
        pP.c * pV.z);
};

cc.kmPlaneFromPointNormal = function(pOut, pPoint, pNormal){
    /*
     Planea = Nx
     Planeb = Ny
     Planec = Nz
     Planed = −N⋅P
     */
    pOut.a = pNormal.x;
    pOut.b = pNormal.y;
    pOut.c = pNormal.z;
    pOut.d = -cc.kmVec3Dot(pNormal, pPoint);

    return pOut;
};

/**
 * Creates a plane from 3 points. The result is stored in pOut.
 * pOut is returned.
 */
cc.kmPlaneFromPoints = function(pOut, p1, p2, p3){
    /*
     v = (B − A) × (C − A)
     n = 1⁄|v| v
     Outa = nx
     Outb = ny
     Outc = nz
     Outd = −n⋅A
     */

    var n = new cc.kmVec3(), v1 = new cc.kmVec3(), v2 = new cc.kmVec3();
    cc.kmVec3Subtract(v1, p2, p1); //Create the vectors for the 2 sides of the triangle
    cc.kmVec3Subtract(v2, p3, p1);
    cc.kmVec3Cross(n, v1, v2); //Use the cross product to get the normal

    cc.kmVec3Normalize(n, n); //Normalize it and assign to pOut.m_N

    pOut.a = n.x;
    pOut.b = n.y;
    pOut.c = n.z;
    pOut.d = cc.kmVec3Dot(cc.kmVec3Scale(n, n, -1.0), p1);

    return pOut;
};

cc.kmPlaneIntersectLine = function(pOut, pP, pV1, pV2){
    throw "cc.kmPlaneIntersectLine() hasn't been implemented.";
    /*
     n = (Planea, Planeb, Planec)
     d = V − U
     Out = U − d⋅(Pd + n⋅U)⁄(d⋅n) [iff d⋅n ≠ 0]
     */
    //var d = new cc.kmVec3();

    //cc.kmVec3Subtract(d, pV2, pV1); //Get the direction vector

    //TODO: Continue here!
    /*if (fabs(kmVec3Dot(&pP.m_N, &d)) > kmEpsilon)
     {
     //If we get here then the plane and line are parallel (i.e. no intersection)
     pOut = nullptr; //Set to nullptr

     return pOut;
     } */

    //return null;
};

cc.kmPlaneNormalize = function(pOut, pP){
    var n = new cc.kmVec3();

    n.x = pP.a;
    n.y = pP.b;
    n.z = pP.c;

    var l = 1.0 / cc.kmVec3Length(n); //Get 1/length
    cc.kmVec3Normalize(n, n); //Normalize the vector and assign to pOut

    pOut.a = n.x;
    pOut.b = n.y;
    pOut.c = n.z;

    pOut.d = pP.d * l; //Scale the D value and assign to pOut

    return pOut;
};

cc.kmPlaneScale = function(pOut, pP, s){
    cc.log("cc.kmPlaneScale() has not been implemented.");
};

/**
 * Returns POINT_INFRONT_OF_PLANE if pP is infront of pIn. Returns
 * POINT_BEHIND_PLANE if it is behind. Returns POINT_ON_PLANE otherwise
 */
cc.kmPlaneClassifyPoint = function(pIn, pP){
    // This function will determine if a point is on, in front of, or behind
    // the plane.  First we store the dot product of the plane and the point.
    var distance = pIn.a * pP.x + pIn.b * pP.y + pIn.c * pP.z + pIn.d;

    // Simply put if the dot product is greater than 0 then it is infront of it.
    // If it is less than 0 then it is behind it.  And if it is 0 then it is on it.
    if(distance > 0.001) return cc.POINT_INFRONT_OF_PLANE;
    if(distance < -0.001) return cc.POINT_BEHIND_PLANE;

    return cc.POINT_ON_PLANE;
};


