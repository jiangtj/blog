---
title: 正则
comments: true
date: 2020-05-20
updated: 2020-05-20
---

请输入匹配值：
<textarea id='input-value' rows='5' style='width:100%'></textarea>

正则表达式：<input id='regex' type='text' style='width:70%' />

<input type='button' onclick='doRegex()' value='匹配' />

匹配值：
<div id='output-value'></div>

<script type="text/javascript">
function doRegex() {
  var patt = eval(document.getElementById('regex').value);
  var inputValue = document.getElementById('input-value').value;
  debugger;
  var outputTxt = patt.exec(inputValue);
  document.getElementById('output-value').innerHTML=outputTxt;
}
</script>

