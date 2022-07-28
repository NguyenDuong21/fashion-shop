/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function (config) {
  // Define changes to default configuration here. For example:
  // config.language = 'fr';
  // config.uiColor = '#AADC6E';
  var link_url = $("base").attr("href");
  link_url = "http://localhost:8080/hou.edu.vn/public_html/";
  config.extraPlugins = "html5audio,youtube";
  config.filebrowserImageBrowseUrl =
    link_url + "assets/plugins/js/ckfinder/ckfinder.html?type=Images";
  config.filebrowserFlashBrowseUrl =
    link_url + "assets/plugins/js/ckfinder/ckfinder.html?type=Flash";
  config.filebrowserBrowseUrl =
    link_url + "assets/plugins/js/ckfinder/ckfinder.html";
  config.filebrowserUploadUrl =
    link_url +
    "assets/plugins/js/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Files";
  config.filebrowserImageUploadUrl =
    link_url +
    "assets/plugins/js/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Images";
  config.filebrowserFlashUploadUrl =
    link_url +
    "assets/plugins/js/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Flash";
  config.toolbar = "Basic";
  config.htmlEncodeOutput = false;
  config.entities = false;
  config.basicEntities = false;
};
