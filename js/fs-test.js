function domFile(file) {
  var tr=$('<tr>');
  tr.data('file', file);
  tr.addClass('nohover');
  tr.append($('<td>').append(file.name));
  tr.append($('<td>').append(file.type || 'n/a'));
  tr.append($('<td>').append(file.size));
  tr.append($('<td>').append(file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : 'n/a'));
  tr.append($('<td>'));
  return tr;
}


function domAllFiles(files) {
  var table = $('<table id="result_table" class="hovertable"><tr><th>File name</th><th>File type</th><th>Bytes</th><th>Last modified</th><th>Content</th></tr></table>');
  for (var i = 0, f; f = files[i]; i++) {
    var tr = domFile(f);
    table.append(tr);
//    analyze(f, tr.children.last());
  };
  return table;
}

function handleFileSelect(evt) {
  var files = evt.target.files; // FileList object

  $("#result_table").remove();

  var table = domAllFiles(files);
  $('#list').append(table);
  $('tr').mouseover(function() { $(this).removeClass('nohover').addClass('hover');})
    .mouseout(function() {  $(this).removeClass('hover').addClass('nohover');});
    // .click(function() {
    //   var file = $(this).data('file');
    //   var name = $(this).children().first().text();
    //   console.log(name);
    //   analyze(file, $(this).children().last());
    // });

  setTimeout(function() {$('#result_table tbody tr').each(function() {
    var file = $(this).data('file');
    if (file) {
      var name = $(this).children().first().text();
      console.log(name);
      var td = $(this).children().last();
      if (file.type.match(/image/)) {
        var oFReader = new FileReader();
        var img = $('<img class="preview">');
        oFReader.readAsDataURL(file);
        oFReader.onload = function(oFREvent) {
          img.attr('src',oFREvent.target.result);
        }
        td.append(img);
      } else {
        analyze(file, td);
      }
    }
  });}, 500);
  return null;

}


document.getElementById('files').addEventListener('change', handleFileSelect, false);


// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  console.log('Great success! All the File APIs are supported.');
} else {
  alert('The File APIs are not fully supported in this browser.');
}


// ==========================================================================================

var cc

function analyze(file, domElement) {
  var reader = new FileReader();
  reader.onload = (function(f) {
    return function(e) {
      var contents = e.target.result;
      cc=contents;
      var ttype=getFileContentType(contents);
      domElement.html(ttype);
    };
  })(file);
  reader.readAsBinaryString(file);
}


function getFileContentType(contents) {
  var ttype = null;
  if (contents.length == 0) {
    ttype = 'empty';
  }
  if (! ttype) ttype = isBinary(contents)
  if (! ttype) ttype = isAgreement(contents);
  if (! ttype) ttype = isAgresso(contents);
  if (! ttype) ttype = isBBS(contents);
  if (! ttype) ttype = isE2B(contents);
  if (! ttype) ttype = isEHF(contents);
  if (! ttype) ttype = 'text';
  return ttype;
}


function isBinary(byteArray) {
  var binCount=0;
  var cArr=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  for (var i = 0; i < byteArray.length; i++) {
    var b = byteArray.charCodeAt(i);
//    if (i < 10) console.log(b);
    if (b>=0 && b < 31 && b != 10 && b != 13 && b != 12 && b != 9) {
      binCount ++;
      cArr[b]++;
    }
  }
  console.log(binCount + ':' + byteArray.length + '  ' + cArr);
  return binCount*100/byteArray.length > 1 ?  'binary' : null;
}

function isAgreement(byteArray) {
  return byteArray.match(/<Message>\s*<Response>\s*<FromInfo>/) ? 'B2C Agreement' : null;
}


function isAgresso(byteArray) {
  return byteArray.match(/<ABWInvoice Version="542">\s*<Invoice>/) ? 'Agresso' : null;
}

function isBBS(byteArray) {
  var firstRecord = byteArray.substring(80,160);
//   console.log('<' + firstRecord + '>');
  if (firstRecord.match(/^\s*NY4203/)) {
    return 'BBS eFaktura';
  } else if (firstRecord.match(/^\s*NY4207/)) {
    return 'BBS fakturaprint';
  } else if (firstRecord.match(/^\s*NY04/)) {
    return 'Dirrem';
  } else {
    return null;
  }
}

function isE2B(byteArray) {
  return byteArray.match(/Interchange.*MessageOwner\s*=\s*['"]e2b['"]/) ? 'E2B' : null;
}

function isEHF(byteArray) {
    return byteArray.match(/<(Invoice|CreditNote).*xmlns=["']urn:oasis:names:specification:ubl:schema:xsd:(Invoice|CreditNote)-2["']/) ? 'EHF' : null;
}
