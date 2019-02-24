var WebglCallbackHandler = function(){
  this.doNotCache = false;
  this.gl = renderer.context;
  this.vertexAttribPointerCache = new Map();
}

WebglCallbackHandler.prototype.registerEngineObject = function(object){
  object.mesh.onBeforeRender = function(){
    webglCallbackHandler.onBeforeRender(object);
  }
}

WebglCallbackHandler.prototype.onCreateBuffer = function(){

}

WebglCallbackHandler.prototype.onBeforeRender = function(object){

}

WebglCallbackHandler.prototype.onBeforeVertexAttribPointer = function(index, size, type, normalized, stride, offset, buffer, lineID){
  var curCachedElement;
  if (!this.doNotCache){
    curCachedElement = this.vertexAttribPointerCache.get(index);
    if (curCachedElement){
      var cachedSize = curCachedElement.size;
      var cachedType = curCachedElement.type;
      var cachedNormalized = curCachedElement.normalized;
      var cachedStride = curCachedElement.stride;
      var cachedOffset = curCachedElement.offset;
      var cachedBuffer = curCachedElement.buffer;
      if (cachedSize == size && cachedType == type && cachedNormalized == normalized &&
        cachedStride == stride && cachedOffset == offset && cachedBuffer == buffer){
        return;
      }
    }
  }
  this.gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
  if (!this.doNotCache){
    if (curCachedElement){
      curCachedElement.size = size;
      curCachedElement.type = type;
      curCachedElement.normalized = normalized;
      curCachedElement.stride = stride;
      curCachedElement.offset = offset;
      curCachedElement.buffer = buffer;
      this.vertexAttribPointerCache.set(index, curCachedElement);
    }else{
      this.vertexAttribPointerCache.set(index, {
        size: size, type: type, normalized: normalized, stride: stride, offset: offset, buffer: buffer
      });
    }
  }
}

WebglCallbackHandler.prototype.onBeforeBindBuffer = function(isElementArrayBuffer, buffer, lineID){
  if (!this.doNotCache){
    if (isElementArrayBuffer && this.lastBindElementArrayBuffer){
      if (this.lastBindElementArrayBuffer == buffer){
        return;
      }
    }else if (!isElementArrayBuffer && this.lastBindArrayBuffer){
      if (this.lastBindArrayBuffer == buffer){
        return;
      }
    }
  }
  if (isElementArrayBuffer){
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    if (!this.doNotCache){
      this.lastBindElementArrayBuffer = buffer;
    }
  }else{
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    if (!this.doNotCache){
      this.lastBindArrayBuffer = buffer;
    }
  }
}
