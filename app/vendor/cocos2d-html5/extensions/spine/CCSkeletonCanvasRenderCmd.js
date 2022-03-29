/****************************************************************************
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

(function(){
    sp.Skeleton.CanvasRenderCmd = function(renderableObject){
        cc.Node.CanvasRenderCmd.call(this, renderableObject);
        this._needDraw = true;

        this._skeletonSprites = [];
    };

    var proto = sp.Skeleton.CanvasRenderCmd.prototype = Object.create(cc.Node.CanvasRenderCmd.prototype);
    proto.constructor = sp.Skeleton.CanvasRenderCmd;

    proto.rendering = function (wrapper, scaleX, scaleY) {
        var node = this._node, i, n, sprites = this._skeletonSprites, selSpriteCmd;
        wrapper = wrapper || cc._renderContext;

        //draw skeleton sprite by it self
        wrapper.save();
        //set to armature mode (spine need same way to draw)
        wrapper._switchToArmatureMode(true, this._worldTransform, scaleX, scaleY);
        for(i = 0, n = sprites.length; i < n; i++){
            selSpriteCmd = sprites[i]._renderCmd;
            if(sprites[i]._visible && selSpriteCmd && selSpriteCmd.rendering){
                selSpriteCmd.rendering(wrapper, scaleX, scaleY);
                selSpriteCmd._dirtyFlag = 0;
            }
        }
        wrapper._switchToArmatureMode(false);
        wrapper.restore();

        if (!node._debugSlots && !node._debugBones)
            return;

        wrapper.setTransform(this._worldTransform, scaleX, scaleY);
        var locSkeleton = node._skeleton;
        var attachment, slot, drawingUtil = cc._drawingUtil;
        if (node._debugSlots) {
            // Slots.
            drawingUtil.setDrawColor(0, 0, 255, 255);
            drawingUtil.setLineWidth(1);

            var points = [];
            for (i = 0, n = locSkeleton.slots.length; i < n; i++) {
                slot = locSkeleton.drawOrder[i];
                if (!slot.attachment || slot.attachment.type != sp.ATTACHMENT_TYPE.REGION)
                    continue;
                attachment = slot.attachment;
                sp._regionAttachment_updateSlotForCanvas(attachment, slot, points);
                drawingUtil.drawPoly(points, 4, true);
            }
        }

        if (node._debugBones) {
            // Bone lengths.
            var bone;
            drawingUtil.setLineWidth(2);
            drawingUtil.setDrawColor(255, 0, 0, 255);

            for (i = 0, n = locSkeleton.bones.length; i < n; i++) {
                bone = locSkeleton.bones[i];
                var x = bone.data.length * bone.m00 + bone.worldX;
                var y = bone.data.length * bone.m10 + bone.worldY;
                drawingUtil.drawLine(
                    {x: bone.worldX, y: bone.worldY},
                    {x: x, y: y});
            }

            // Bone origins.
            drawingUtil.setPointSize(4);
            drawingUtil.setDrawColor(0, 0, 255, 255); // Root bone is blue.

            for (i = 0, n = locSkeleton.bones.length; i < n; i++) {
                bone = locSkeleton.bones[i];
                drawingUtil.drawPoint({x: bone.worldX, y: bone.worldY});
                if (i === 0)
                    drawingUtil.setDrawColor(0, 255, 0, 255);
            }
        }
    };

    proto._createChildFormSkeletonData = function(){
        var node = this._node;
        var locSkeleton = node._skeleton, rendererObject, rect;
        for (var i = 0, n = locSkeleton.drawOrder.length; i < n; i++) {
            var slot = locSkeleton.drawOrder[i];
            var attachment = slot.attachment;
            if (!(attachment instanceof spine.RegionAttachment))
                continue;
            rendererObject = attachment.rendererObject;
            rect = cc.rect(rendererObject.x, rendererObject.y, rendererObject.width,rendererObject.height);
            var sprite = new cc.Sprite();
            sprite.initWithTexture(rendererObject.page._texture, rect, rendererObject.rotate, false);
            sprite._rect.width = attachment.width;
            sprite._rect.height = attachment.height;
            sprite.setContentSize(attachment.width, attachment.height);
            sprite.setRotation(-(slot.bone.worldRotation + attachment.rotation));
            this._skeletonSprites.push(sprite);
            slot.currentSprite = sprite;
        }
    };

    proto._updateChild = function(){
        var node = this._node;
        var locSkeleton = node._skeleton;
        locSkeleton.updateWorldTransform();
        var drawOrder = node._skeleton.drawOrder;
        for (var i = 0, n = drawOrder.length; i < n; i++) {
            var slot = drawOrder[i];
            var attachment = slot.attachment, selSprite = slot.currentSprite;
            if (!(attachment instanceof spine.RegionAttachment)) {
                if(selSprite)
                    selSprite.setVisible(false);
                continue;
            }
            if(!selSprite){
                var rendererObject = attachment.rendererObject;
                var rect = cc.rect(rendererObject.x, rendererObject.y, rendererObject.width,rendererObject.height);
                var sprite = new cc.Sprite();
                sprite.initWithTexture(rendererObject.page._texture, rect, rendererObject.rotate, false);
                sprite._rect.width = attachment.width;
                sprite._rect.height = attachment.height;
                sprite.setContentSize(attachment.width, attachment.height);
                this._skeletonSprites.push(sprite);
                selSprite = slot.currentSprite = sprite;
            }
            selSprite.setVisible(true);
            //update color and blendFunc
            selSprite.setBlendFunc(cc.BLEND_SRC, slot.data.additiveBlending ? cc.ONE : cc.BLEND_DST);

            var bone = slot.bone;
            selSprite.setPosition(bone.worldX + attachment.x * bone.m00 + attachment.y * bone.m01,
                    bone.worldY + attachment.x * bone.m10 + attachment.y * bone.m11);
            selSprite.setScale(bone.worldScaleX, bone.worldScaleY);
            selSprite.setRotation(-(slot.bone.worldRotation + attachment.rotation));
            selSprite.setOpacity(0 | (slot.skeleton.a * slot.a * 255));
            var r = 0 | (slot.skeleton.r * slot.r * 255);
            var g = 0 | (slot.skeleton.g * slot.g * 255);
            var b = 0 | (slot.skeleton.b * slot.b * 255);
            selSprite.setColor(cc.color(r,g,b));
        }
    };
})();