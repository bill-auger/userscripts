// ==UserScript==
// @name        koding
// @namespace   http://bill-auger.github.io/
// @include     https://koding.com/*
// @version     1
// @grant       none
// ==/UserScript==


// DEBUG begin
var DEBUG_TRACE = false ;
function DBG(dbg) { if (DEBUG_TRACE) console.log(dbg) ; }
function TRACE(dbg) { if (DEBUG_TRACE) console.log("gm-koding: " + dbg) ; }
TRACE("begin") ;
// DEBUG end


// bb page
var ACTIVITY_URL        = "https://koding.com/Activity" ;
var MOST_LIKED_DIV_CSS  = '.activity-content > div:nth-child(3)' ;
var MOST_RECENT_DIV_CSS = 'div.listview-wrapper:nth-child(4)' ;
// editor page
var ACE_URL             = "https://koding.com/Ace" ;
var TREEVIEW_ASIDE_CSS  = '#main-tab-view > div.kdview.kdtabpaneview.ace.clearfix.content-area-pane.active > div > aside' ;
var EDITOR_SECTION_CSS  = '#main-tab-view > div.kdview.kdtabpaneview.ace.clearfix.content-area-pane.active > div > section' ;
var KEYBINDINGS_DIV_CSS = '.kdmodal-content' ;

var SIDEBAR_TOGGLE_KEY = 115 ; // F4
var SIDEBAR_W          = 247 ;

var TOGGLE_SIDEBAR_KEY_TEXT  = "F4" ;
var TOGGLE_SIDEBAR_DESC_TEXT = "toggle documents treeview sidebar visibility" ;


var CurrentUrl                 = "" ;
var SidebarIsCollapsed         = false ;
var HasKeybindingsTableEntries = false ;

var WaitDomIvl ;


/* bb page */

function swapLists()
{
DBG("swapLists() most_liked_div="  + document.querySelector(MOST_LIKED_DIV_CSS)) ;
DBG("swapLists() most_recent_div=" + document.querySelector(MOST_RECENT_DIV_CSS)) ;

  var most_liked_div , most_recent_div , parent_div ;
  if (!(most_liked_div  = document.querySelector(MOST_LIKED_DIV_CSS))  ||
      !(most_recent_div = document.querySelector(MOST_RECENT_DIV_CSS)) ||
      !(parent_div      = most_recent_div.parentNode)                        ) return ;

TRACE("swapping post lists") ;

var ch = most_recent_div.parentNode.children ;
for (var i = 0 ; i < 4 ; ++i) DBG("swapLists() ch[" + i + "]=" + ch[i] + " " + ch[i].className) ;
DBG("swapLists() parent_div=" + parent_div + " nChildren=" + parent_div.children.length) ;
var most_liked_header_div = parent_div.children[1] ;
DBG("swapLists() most_liked_header_div=" + most_liked_header_div + " " + most_liked_header_div.className) ;

  window.clearInterval(WaitDomIvl) ;
  parent_div.insertBefore(most_recent_div , most_liked_header_div) ;
}


/* editor page */

function allowToggleSidebar()
{
DBG("allowToggleSidebar() treeview_div="    + document.querySelector(TREEVIEW_ASIDE_CSS)) ;
DBG("allowToggleSidebar() editor_div="      + document.querySelector(EDITOR_SECTION_CSS)) ;
DBG("allowToggleSidebar() keybindings_div=" + document.querySelector(KEYBINDINGS_DIV_CSS)) ;
if (document.querySelector(KEYBINDINGS_DIV_CSS))
DBG("allowToggleSidebar() keybindings_table=" + document.querySelector(KEYBINDINGS_DIV_CSS).getElementsByTagName('table')[0]) ;

  var body , treeview_div , editor_div , keybindings_div , keybindings_table ;
  if (!(body              = document.getElementsByTagName('body')[0])   ||
      !(treeview_div      = document.querySelector(TREEVIEW_ASIDE_CSS)) ||
      !(editor_div        = document.querySelector(EDITOR_SECTION_CSS))  ) return ;

DBG("allowToggleSidebar() ready" +
  " - body.onkeydown " + ((body.onkeydown)? "" : "not ") + "defined" +
  " - HasKeybindingsTableEntries " + ((HasKeybindingsTableEntries)? "" : "not ") + "created") ;

  if (HasKeybindingsTableEntries) return ;

  if ((keybindings_div   = document.querySelector(KEYBINDINGS_DIV_CSS))      &&
      (keybindings_table = keybindings_div.getElementsByTagName('table')[0])  )
  {
TRACE("appending keybindings table entry") ;

    HasKeybindingsTableEntries = true ; window.clearInterval(WaitDomIvl) ;

    // append keybindings table entry
    var key_tr  = document.createElement('tr') ;
    var key_td  = document.createElement('td') ;
    var desc_td = document.createElement('td') ;

    key_td .style.textAlign = 'left' ;
    desc_td.style.textAlign = 'left' ;

    keybindings_table.appendChild(key_tr) ;
    key_tr           .appendChild(key_td) ;
    key_td           .appendChild(document.createTextNode(TOGGLE_SIDEBAR_KEY_TEXT)) ;
    key_tr           .appendChild(desc_td) ;
    desc_td          .appendChild(document.createTextNode(TOGGLE_SIDEBAR_DESC_TEXT)) ;
  }
  
  if (body.onkeydown) return ;

TRACE("assigning onkeydown handler") ;

  body.onkeydown = function(key_ev)
  {
if (CurrentUrl == ACE_URL) DBG("keyCode=" + key_ev.keyCode) ;

    if (CurrentUrl == ACE_URL && key_ev.keyCode == SIDEBAR_TOGGLE_KEY)
    {
TRACE(((SidebarIsCollapsed)? "expending" : "collapsing") + " sidebar") ;

      SidebarIsCollapsed = !SidebarIsCollapsed ;

      // toggle sidebar visibility
      var current_w = editor_div.style.width ;
      var editor_x  = (SidebarIsCollapsed)? "0px"  : SIDEBAR_W + "px" ;
      var editor_w  = (SidebarIsCollapsed)? "100%" : (current_w + SIDEBAR_W) + "px" ;

      treeview_div.style.width      = editor_x ;
      editor_div  .style.width      = editor_w ;
      editor_div  .style.marginLeft = editor_x ;
    }
  } ;
}


/* main */

window.setInterval(function()
{
DBG("window.location=" + window.location + " hasChanged=" + (CurrentUrl != window.location)) ;

  if (CurrentUrl == (CurrentUrl = window.location.toString())) return ;

TRACE("CurrentUrl changed to " + window.location) ;

  if      (window.location == ACTIVITY_URL)
    WaitDomIvl = window.setInterval(swapLists , 1000) ;
  else if (window.location == ACE_URL)
    WaitDomIvl = window.setInterval(allowToggleSidebar , 1000) ;
} , 1000) ;

