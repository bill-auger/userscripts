// ==UserScript==
// @name        edx-dashboard
// @namespace   http://bill-auger.github.io/
// @include     https://courses.edx.org/dashboard*
// @version     1
// @grant       none
// ==/UserScript==


// DEBUG begin
var DEBUG_TRACE = true ;
function TRACE(dbg) { if (DEBUG_TRACE) console.log("gm-edx-dashboard: " + dbg) ; }
TRACE("begin") ;
// DEBUG end


var COURSES_SECTION_ID      = 'my-courses' ;
var COURSES_UL_ID           = 'listing-courses' ;
var COURSE_LI_CLASS         = 'course-item' ;
var ACTIVE_COURSE_A_CLASS   = 'enter-course' ;
var ARCHIVED_COURSE_A_CLASS = 'enter-course archived' ;

var STORAGE_KEY             = 'edx-dashboard' ;
var STATE_KEY               = 'filter-state' ;
var SHOW_ACTIVE             = 'show-active-courses' ;
var SHOW_ARCHIVED           = 'show-archived-courses' ;
var SHOW_UPCOMING           = 'show-upcoming-courses' ;
var ACTIVE_SELECT_TEXT      = "Current Courses" ;
var ARCHIVED_SELECT_TEXT    = "Archived Courses" ;
var UPCOMING_SELECT_TEXT    = "Upcoming Courses" ;


var CoursesSection ;    // init()
var CoursesHeader ;     // init()
var CoursesUl ;         // init()
var ActiveCourseLis  ;  // sortCourses()
var ArchivedCourseLis ; // sortCourses()
var UpcomingCourseLis ; // sortCourses()
var State ;             // setState()


/* main */

function init()
{
  if (!(CoursesSection = document      .getElementById(COURSES_SECTION_ID))     ||
      !(CoursesHeader  = CoursesSection.getElementsByTagName('header')[0] &&
                         CoursesSection.getElementsByTagName('header')[0]
                                       .getElementsByTagName('h2')[0])          ||
      !(CoursesUl      = CoursesSection.getElementsByClassName(COURSES_UL_ID)[0])) return ;

TRACE("DOM ready") ;

  var coursesSelectTable = document.createElement('table') ;
  var coursesSelectTr    = document.createElement('tr') ;
  var activeSelectTd     = document.createElement('td') ;
  var archivedSelectTd   = document.createElement('td') ;
  var upcomingSelectTd   = document.createElement('td') ;

  coursesSelectTable.style.width          = '100%' ;
  activeSelectTd    .style.textDecoration = 'underline' ;
  archivedSelectTd  .style.textDecoration = 'underline' ;
  upcomingSelectTd  .style.textDecoration = 'underline' ;
  activeSelectTd    .style.cursor         = 'pointer' ;
  archivedSelectTd  .style.cursor         = 'pointer' ;
  upcomingSelectTd  .style.cursor         = 'pointer' ;
  activeSelectTd    .onclick = function() { setState(SHOW_ACTIVE) ;   filterCourses() ; } ;
  archivedSelectTd  .onclick = function() { setState(SHOW_ARCHIVED) ; filterCourses() ; } ;
  upcomingSelectTd  .onclick = function() { setState(SHOW_UPCOMING) ; filterCourses() ; } ;

  CoursesHeader     .innerHTML = "" ;
  CoursesHeader     .appendChild(coursesSelectTable) ;
  coursesSelectTable.appendChild(coursesSelectTr) ;
  coursesSelectTr   .appendChild(activeSelectTd) ;
  activeSelectTd    .appendChild(document.createTextNode(ACTIVE_SELECT_TEXT)) ;
  coursesSelectTr   .appendChild(archivedSelectTd) ;
  archivedSelectTd  .appendChild(document.createTextNode(ARCHIVED_SELECT_TEXT)) ;
  coursesSelectTr   .appendChild(upcomingSelectTd) ;
  upcomingSelectTd  .appendChild(document.createTextNode(UPCOMING_SELECT_TEXT)) ;

TRACE("header ready") ;

  setState(loadState()) ; sortCourses() ; filterCourses() ;
}

function sortCourses()
{
TRACE("sortCourses()") ;

  var activeCourseAs    = CoursesUl.getElementsByClassName(ACTIVE_COURSE_A_CLASS) ;
  ActiveCourseLis   = new Array() ;
  var archivedCourseAs  = CoursesUl.getElementsByClassName(ARCHIVED_COURSE_A_CLASS) ;
  ArchivedCourseLis = new Array() ;
  var courseLis         = CoursesUl.getElementsByClassName(COURSE_LI_CLASS) ;
  UpcomingCourseLis = new Array() ;

  eachElementDo(courseLis , hasActiveButton   , pushOnto(ActiveCourseLis)) ;
  eachElementDo(courseLis , hasArchivedButton , pushOnto(ArchivedCourseLis)) ;
  eachElementDo(courseLis , isUpcoming        , pushOnto(UpcomingCourseLis)) ;

TRACE("found nActiveCourseLis=" + ActiveCourseLis.length + " nArchivedCourseLis=" + ArchivedCourseLis.length +  " nUpcomingCourseLis=" + UpcomingCourseLis.length) ;
}

function filterCourses()
{
TRACE("filterCourses()") ;

  var existingLis = CoursesUl.getElementsByClassName(COURSE_LI_CLASS) ;
  var removeLis   = new Array() ;

  eachElementDo(existingLis       , isTrue(true)                   , pushOnto(removeLis)) ;
  eachElementDo(removeLis         , isTrue(true)                   , removeCourse) ;
  eachElementDo(ActiveCourseLis   , isTrue(State == SHOW_ACTIVE)   , appendCourse) ;
  eachElementDo(ArchivedCourseLis , isTrue(State == SHOW_ARCHIVED) , appendCourse) ;
  eachElementDo(UpcomingCourseLis , isTrue(State == SHOW_UPCOMING) , appendCourse) ;
}



/* localStorage helpers */

function isLocalStorageAvailable() { return (typeof(localStorage) != 'undefined') ; }

function setState(state)
{
  State = state ;

  if (isLocalStorageAvailable())
  {
    var configObj        = new Object() ;
    configObj[STATE_KEY] = state ;
    localStorage.setItem(STORAGE_KEY , JSON.stringify(configObj)) ;
  }
}

function loadState()
{
  var configObj ;
  if (isLocalStorageAvailable())
  {
    var storageString = localStorage.getItem(STORAGE_KEY) ;
    try { configObj = JSON.parse(storageString) ; } catch(ex) {}
  }

  return (configObj)? configObj[STATE_KEY] : SHOW_ACTIVE ;
}


/* DOM helpers */

function eachElementDo(aNodeList , validationFn , performFn)
{
//TRACE("eachElementDo() nLis=" + aNodeList.length + " lis=" + aNodeList + " validationFn=" + validationFn + " performFn=" + performFn) ;
//for (var nodeN = 0 ; nodeN < aNodeList.length ; ++nodeN) TRACE("eachElementDo() nodeN=" + nodeN + " valid?=" + validationFn(aNodeList[nodeN]) + " lis[nodeN]=" + aNodeList[nodeN]) ;

  for (var nodeN = 0 ; nodeN < aNodeList.length ; ++nodeN)
    if (validationFn(aNodeList[nodeN])) performFn(aNodeList[nodeN]) ;
}

function hasButton(anElement , btnClass) {
//TRACE("hasButton() btnClass='" + btnClass + "' nFound=" + anElement.getElementsByClassName(btnClass).length + " el=" + anElement.getElementsByClassName(btnClass)[0]) ;

  return !!anElement.getElementsByClassName(btnClass).length ;
}

function hasArchivedButton(anElement)
{
  return hasButton(anElement , ARCHIVED_COURSE_A_CLASS) ;
}

function hasActiveButton(anElement)
{
  return hasButton(anElement , ACTIVE_COURSE_A_CLASS) && !hasArchivedButton(anElement) ;
}

function isUpcoming(anElement)
{
  return !hasActiveButton(anElement) && !hasArchivedButton(anElement) ;
}

function removeCourse(anElement) { CoursesUl.removeChild(anElement) ; }

function appendCourse(anElement) { CoursesUl.appendChild(anElement) ; }


/* misc helpers */

function isTrue(aBool) { return function(anElement) { return aBool ; } ; }

function pushOnto(anArray) { return function(anElement) { anArray.push(anElement) ; } ; }


window.onload = init ;
