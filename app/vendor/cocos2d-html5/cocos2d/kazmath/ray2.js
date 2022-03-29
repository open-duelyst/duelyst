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

cc.kmRay2 = function(start, dir){
  this.start = start || new cc.kmVec2();
    this.start = start || new cc.kmVec2();
};

cc.kmRay2Fill = function(ray, px, py,vx,vy){
    ray.start.x = px;
    ray.start.y = py;
    ray.dir.x = vx;
    ray.dir.y = vy;
};

cc.kmRay2IntersectLineSegment = function(ray, p1, p2, intersection){
    var x1 = ray.start.x;
    var y1 = ray.start.y;
    var x2 = ray.start.x + ray.dir.x;
    var y2 = ray.start.y + ray.dir.y;
    var x3 = p1.x;
    var y3 = p1.y;
    var x4 = p2.x;
    var y4 = p2.y;

    var denom = (y4 -y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    var ua, x, y;
    //If denom is zero, the lines are parallel
    if(denom > -cc.kmEpsilon && denom < cc.kmEpsilon) {
        return cc.KM_FALSE;
    }

    ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
//    var ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

    x = x1 + ua * (x2 - x1);
    y = y1 + ua * (y2 - y1);

    if(x < cc.kmMin(p1.x, p2.x) - cc.kmEpsilon ||
        x > cc.kmMax(p1.x, p2.x) + cc.kmEpsilon ||
        y < cc.kmMin(p1.y, p2.y) - cc.kmEpsilon ||
        y > cc.kmMax(p1.y, p2.y) + cc.kmEpsilon) {
        //Outside of line
        //printf("Outside of line, %f %f (%f %f)(%f, %f)\n", x, y, p1.x, p1.y, p2.x, p2.y);
        return cc.KM_FALSE;
    }

    if(x < cc.kmMin(x1, x2) - cc.kmEpsilon ||
        x > cc.kmMax(x1, x2) + cc.kmEpsilon ||
        y < cc.kmMin(y1, y2) - cc.kmEpsilon ||
        y > cc.kmMax(y1, y2) + cc.kmEpsilon) {
        //printf("Outside of ray, %f %f (%f %f)(%f, %f)\n", x, y, x1, y1, x2, y2);
        return cc.KM_FALSE;
    }

    intersection.x = x;
    intersection.y = y;

    return cc.KM_TRUE;
};

cc.calculate_line_normal = function(p1, p2, normal_out){
    var tmp = new cc.kmVec2();
    cc.kmVec2Subtract(tmp, p2, p1); //Get direction vector

    normal_out.x = -tmp.y;
    normal_out.y = tmp.x;
    cc.kmVec2Normalize(normal_out, normal_out);

    //TODO: should check that the normal is pointing out of the triangle
};

cc.kmRay2IntersectTriangle = function(ray, p1, p2, p3, intersection, normal_out){
    var intersect = new cc.kmVec2();
    var final_intersect = new cc.kmVec2();
    var  normal = new cc.kmVec2();
    var distance = 10000.0;
    var intersected = cc.KM_FALSE;

    var tmp,this_distance;

    if(cc.kmRay2IntersectLineSegment(ray, p1, p2, intersect)) {
        tmp = new cc.kmVec2();

        intersected = cc.KM_TRUE;
        this_distance = cc.kmVec2Length(cc.kmVec2Subtract(tmp, intersect, ray.start));
        if(this_distance < distance) {
            final_intersect.x = intersect.x;
            final_intersect.y = intersect.y;
            distance = this_distance;

            cc.calculate_line_normal(p1, p2, normal);
        }
    }

    if(cc.kmRay2IntersectLineSegment(ray, p2, p3, intersect)) {
        tmp = new cc.kmVec2();
        intersected = cc.KM_TRUE;

        this_distance = cc.kmVec2Length(cc.kmVec2Subtract(tmp, intersect, ray.start));
        if(this_distance < distance) {
            final_intersect.x = intersect.x;
            final_intersect.y = intersect.y;
            distance = this_distance;

            cc.calculate_line_normal(p2, p3, normal);
        }
    }

    if(cc.kmRay2IntersectLineSegment(ray, p3, p1, intersect)) {
        tmp = new cc.kmVec2();
        intersected = cc.KM_TRUE;

        this_distance = cc.kmVec2Length(cc.kmVec2Subtract(tmp, intersect, ray.start));
        if(this_distance < distance) {
            final_intersect.x = intersect.x;
            final_intersect.y = intersect.y;
            distance = this_distance;

            cc.calculate_line_normal(p3, p1, normal);
        }
    }

    if(intersected) {
        intersection.x = final_intersect.x;
        intersection.y = final_intersect.y;
        if(normal_out) {
            normal_out.x = normal.x;
            normal_out.y = normal.y;
        }
    }

    return intersected;
};

cc.kmRay2IntersectCircle = function(ray, centre, radius, intersection) {
    cc.log("cc.kmRay2IntersectCircle() has not been implemented.");
};