---
title: QRCode
comments: true
---

请输入值：
<textarea id='input-value' rows='5' style='width:100%'></textarea>

<input type='button' onclick='generate()' value='生成' />

二维码：
<canvas id="canvas"></canvas>

<script src="https://cdn.jsdelivr.net/npm/qrcode@1.3.3/build/qrcode.min.js" integrity="sha256-u+Rro3XIli4fMcm5/CrEJQ6TTaJtvdzskIim2GV6q38=" crossorigin="anonymous"></script>
<script>
function generate() {
  QRCode.toCanvas(document.getElementById('canvas'), document.getElementById('input-value').value, function (error) {
    if (error) console.error(error)
    console.log('success!');
  })
}
</script>
