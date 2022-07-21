
	function MBitmap(bd, rows)
	{
		Sprite.call(this);
		
		this.bitmapData = bd;
		this.frames = [];
		this.totalFrames = rows;
		this.currentFrame = 0;
		
		if(bd.width == 0) // not loaded
			bd.loader.addEventListener2(Event.COMPLETE, this.init, this);
		else this.init();
	}
	MBitmap.prototype = new Sprite();
	
	MBitmap.prototype.init = function(e)
	{
		var w = this.bitmapData.width;
		var h = this.bitmapData.height/this.totalFrames;
		var f = 1/this.totalFrames;
		
		for(var i=0; i<this.totalFrames; i++)
		{
			var gr = new Graphics();
			gr.beginBitmapFill(this.bitmapData);
			gr.drawTriangles([0,0, w,0, 0,h, w,h], [0,1,2, 1,2,3], [0,i*f, 1,i*f, 0,(i+1)*f, 1,(i+1)*f ]);
			this.frames.push(gr);
		}
		this.graphics = this.frames[this.currentFrame];
	}
	
	MBitmap.prototype.gotoAndStop = function(k)
	{
		this.currentFrame = k%this.totalFrames;
		if(this.bitmapData.width) this.graphics = this.frames[k%this.totalFrames];
	}
