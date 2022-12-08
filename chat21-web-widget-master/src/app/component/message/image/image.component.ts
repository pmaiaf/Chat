import { Globals } from 'src/app/utils/globals';
import { Component, Input, OnInit, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { popupUrl } from 'src/chat21-core/utils/utils';
import { saveAs} from 'file-saver';

@Component({
  selector: 'chat-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit {

  @Input() metadata: any;
  @Input() width: number;
  @Input() height: number;
  @Output() onElementRendered = new EventEmitter<{element: string, status: boolean}>();

  loading: boolean = true
  tooltipMessage: string;
  tooltipOptions = {
    'show-delay': 0,
    'tooltip-class': 'chat-tooltip',
    'theme': 'light',
    'shadow': false,
    'hide-delay-mobile': 0,
    'hideDelayAfterClick': 3000,
    'hide-delay': 200
  };

  popupUrl = popupUrl;
  
  constructor() { }

  ngOnInit() {
  }

  onLoaded(event){
    this.loading = false
    this.onElementRendered.emit({element: "image", status:true})
  }

  downloadImage(url: string, fileName: string) {
    console.log('Image COMP - IMAGE URL ', url) 
    console.log('Image COMP - IMAGE FILENAME ', fileName) 
    fileName? null: fileName = decodeURIComponent(decodeURIComponent(url).split('/').pop())
    // const a: any = document.createElement('a');
    // console.log('ellll', this.el)
    // a.href = this.sanitizer.bypassSecurityTrustUrl(url);
    // a.download = fileName;
    // document.body.appendChild(a);
    // a.style = 'display: none';
    // a.click();
    // a.remove();
    saveAs(url, fileName);
    // this.onClickImage()
  }

  onClickImage(){

  //   var ifrm = document.createElement("iframe");
  //   ifrm.setAttribute("frameborder", "0");
  //   ifrm.setAttribute("border", "0");
  //   ifrm.setAttribute('id','tiledeskiframe');
  //   ifrm.setAttribute('tiledesk_context','parent');
  //   ifrm.setAttribute('style', 'width: 100%; height: 100%; position: fixed; top: 0px; left: 0px; z-index: 2147483003; border: 0px;')

  //   var iframeContent = '<html>'
  //   iframeContent += '<head></head>'
  //   iframeContent += '<body>'
  //   iframeContent +=  '<div class="frame-root">'
  //   iframeContent +=    '<div class="frame-content">'
  //   iframeContent +=      '<div class="tiledesk-popup" style="opacity: 1;"></div>'
  //   iframeContent +=      '<div role="button" tabindex="-1" class="tidio-popup-1y163m9">'
  //   iframeContent +=        '<button type="button" data-testid="closeButton" class="tidio-popup-fru4e5 >'
  //   iframeContent +=          '<svg id="ic_close" fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path><path d="M0 0h24v24H0z" fill="none"></path></svg>'
  //   iframeContent +=        '</button>'
  //   iframeContent +=        '<a href="#popup" data-testid="popupImage-wrapper" class="tidio-popup-vgwcqv" style="opacity: 1; transform: translate3d(0px, 0px, 0px);">'
  //   iframeContent +=          '<img src="'+this.metadata.src+'" alt="popup" class="tidio-popup-wuejeg">'
  //   iframeContent +=        '</a>'
  //   iframeContent +=      '</div>'
  //   iframeContent +=     '</div>'
  //   iframeContent +=    '</div>'
  //   iframeContent +='</body>'
  //   iframeContent +='</html>'

  //   var tiledeskdiv = this.globals.windowContext.document.getElementById('tiledeskdiv');

  //   tiledeskdiv.appendChild(ifrm);
  //   ifrm.contentWindow.document.open();
  //   ifrm.contentWindow.document.write(iframeContent);
  //   ifrm.contentWindow.document.close();

  //   ifrm.onload = function(ev) {
  //     // var button = document.getElementById("button");
  //     // button.addEventListener("click", function(event){
  //     //   alert(event.target);
  //     // });
  //   };
    
  }


}
