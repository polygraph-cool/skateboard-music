// D3 is included by globally by default
import debounce from 'lodash.debounce';
import isMobile from './utils/is-mobile';
import graphic from './graphic';
import joyplot from './joyplot';
import bubbles from './bubbles';
import waffle from './waffle';

const bodySel = d3.select('body');
let previousWidth = 0;

function resize() {
	const width = bodySel.node().offsetWidth;
	if (previousWidth !== width) {
		previousWidth = width;
		graphic.resize();
	}
}

function init() {
	var soundWrapper = d3.select(".sound-wrapper");

	soundWrapper.on("click",function(d){
		var videoNode = d3.select(".intro_video").select("video").node();
		if(videoNode.muted){
			videoNode.muted = false;
			soundWrapper.select(".sound-on").style("display","none");
			soundWrapper.select(".sound-off").style("display","block");
		}
		else{
			videoNode.muted = true;
			soundWrapper.select(".sound-on").style("display",null);
			soundWrapper.select(".sound-off").style("display",null);
		}
	})
	// add mobile class to body tag
	bodySel.classed('is-mobile', isMobile.any());
	// setup resize event
	window.addEventListener('resize', debounce(resize, 150));
	//
	//joyplot enter
	joyplot.init();
	//
	// //new_test enter
	bubbles.init()
	//
	// //waffle chart
	waffle.init()

}

init();
