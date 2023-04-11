chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveToDigiboxx",
    title: "Save Image",
    contexts: ["image"]
  });

});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  // console.log(info)
  if (info.menuItemId === "saveToDigiboxx") {
    //  console.log("Available")
    checkLimit(info.srcUrl)

  }
  chrome.windows.create({
    width: 350,
    height: 250,
    top: 200,
    left: 400,
    type: "popup",
    url: "alert.html"
  });
  console.log("Hello");
});
const imageType = {
  'image/jpeg': '.jpeg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
}
async function getFileFromUrl(url, defaultType = 'image/jpeg') {
  const response = await fetch(url);
  const data = await response.blob();
  const fileSize = data.size;
  // console.log(data)
  // console.log(fileSize)
  chrome.storage.sync.set({ fileSize: fileSize }, function () {
    // console.log('Settings saved');
  });

  const name = url.replaceAll('.').split('/')
  return new File([data], name[(name.length) - 1] + imageType[data.type], {
    type: data.type || defaultType,
  });
}
const getUrl = async (url, method, headers, body) => {
  const response = await fetch(url, { method, headers, body })
  return response.json()
}

// async function checkLimit(url) {
//   console.log("Upload")
//   const file = await getFileFromUrl(url);
//   const fileSize = chrome.storage.sync.get(['fileSize'], function(items) {
//     console.log(items)
//     //message('Settings retrieved', items);
//   });
//   const userToken =   chrome.storage.sync.get(['userToken'], async function(items) {
//     const userLimt = await getUrl("https://apitest.digiboxx.com/dgb_user_func/dgb_check_user_limit_fn/" , "POST" , {
//       "Content-Type": "application/json",
//       "accept": "application/json",
//        'Authorization':`Bearer ${items.userToken}`,
//       "x-request-referrer": "https://apitest.digiboxx.com/"
//     },
//     JSON.stringify({
//       is_managed: "N",
//     })); 
//     // message('Settings retrieved', items);
//     console.log(userLimt)
//     console.log(items)
//     console.log(fileSize)
//   });
//   }

async function checkLimit(url) {
  // console.log("Upload")
  const file = await getFileFromUrl(url);
  console.log(file)
  const userToken = chrome.storage.sync.get(['userToken'], async function (items) {
    const userLimt = await getUrl("https://apitest.digiboxx.com/dgb_user_func/dgb_check_user_limit_fn/", "POST", {
      "Content-Type": "application/json",
      "accept": "application/json",
      'Authorization': `Bearer ${items.userToken}`,
      "x-request-referrer": "https://apitest.digiboxx.com/"
    },
      JSON.stringify({
        is_managed: "N",
      }));
    // message('Settings retrieved', items);
    console.log(userLimt)
    // console.log(userLimt.bytes_left)
    // console.log(items)
    const fileSize = chrome.storage.sync.get(['fileSize'], function (items) {
      // console.log(items)
      if (userLimt.bytes_left > items.fileSize) {
        //  console.log("store")
        minio(url)
      }
    });
    // console.log(fileSize)
  });
}

async function minio(url) {
  // console.log("Minio")
  const file = await getFileFromUrl(url);
  console.log(file)
  // console.log(file.type.split('/')[1])
  const minioData = new FormData();
  minioData.append("file_title", '6352_' + file.name);
  minioData.append("file_type", file.type.split('/')[1]);
  minioData.append("file_size", file.size.toString());
  minioData.append("folder_session", "0");
  minioData.append("folder_is_resource", "0");
  minioData.append("file_name", file.name);
  minioData.append("digiPath", "");
  minioData.append("parent_folder", "0");
  minioData.append("replace_file", "0");
  const userToken = chrome.storage.sync.get(['userToken'], async function (items) {
    const minio = await getUrl("https://apitest.digiboxx.com/dgb_asset_file_mgmt_func/dgb_get_minio_url_fn/", "POST", {
      // "Content-Type": "application/json",
      "accept": "application/json",
      'Authorization': `Bearer ${items.userToken}`,
      "x-request-referrer": "https://apitest.digiboxx.com/"
    },
      // JSON.stringify({
      //   file_title: file.name,
      //   file_type:file.type,
      //   file_size:file.size,
      //   folder_session: 0,
      //   folder_is_resource: 0,
      //   file_name: file.name,
      //   digiPath: '',
      //   parent_folder: 0,
      //   replace_file: 0
      // })
      minioData

    );
    // message('Settings retrieved', items);
    console.log(minio)
    const file_id = minio.file_id;
    const minioUrl = minio.url;
    // console.log(file_id)
    // console.log(minioUrl)
    // fileUpload(url , file_id , minioUrl )
    if (minio.status === 'success') {
      console.log("call upload")
       fileUpload(url , file_id , minioUrl )
      // let reqhttp = new XMLHttpRequest();
      // reqhttp.open("PUT", minioUrl, false);
      // reqhttp.onload = () => {
      //   if (reqhttp.status == 200) {
      //     let fileUploadData = new FormData();
      //     fileUploadData.append("tag_details1", "[\"jpeg\"]");
      //     fileUploadData.append("user_details", "{}");
      //     fileUploadData.append("file_title1", file.name.split('.')[0]);
      //     fileUploadData.append("file_id", file_id.toString());  //minio resp
      //     fileUploadData.append("file_description", file.name);
      //     fileUploadData.append("file_size1", file.size.toString());
      //     fileUploadData.append("file_digiPath", "");
      //     fileUploadData.append("folder_session", "0");
      //     fileUploadData.append("lastModified", file.lastModified.toString());
      //     fileUploadData.append("folder_is_resource", "0");
      //     fileUploadData.append("folder_is_downloadale", "1");
      //     fileUploadData.append("resource_array", "[]");
      //     fileUploadData.append("downloadable_array", "[]");
      //     fileUploadData.append("new_folder_name", "");
      //     fileUploadData.append("folder_color", "");
      //     fileUploadData.append("replace_file", "0");
      //     fileUploadData.append("chooseFile1", '6352_' + file.name);
      //     const userToken = chrome.storage.sync.get(['userToken'], async function (items) {
      //       const fileUpload = await getUrl("https://apitest.digiboxx.com/dgb_asset_file_mgmt_func/dgb_user_file_upload_fn/", "POST", {
      //         // "Content-Type": "application/json",
      //         "accept": "application/json",
      //         'Authorization': `Bearer ${items.userToken}`,
      //         "x-request-referrer": "https://apitest.digiboxx.com/"
      //       } , fileUploadData)
      //     })
      //   }
      // }
    }
  });
}

async function fileUpload(url, file_id, minioUrl) {
  // console.log("File Upload")
  const file = await getFileFromUrl(url);
  console.log(file)
  const fileUploadData = new FormData();
  // const fileTypeArray = new Array([file.type.split('/')[1]])
  // console.log(fileTypeArray)
  // console.log([file.type.split('/')[1]])
  //  console.log(file_id) "tag_details1": "[\"jpg\"]",
  fileUploadData.append("tag_details1", "[jpeg]");
  fileUploadData.append("user_details", "{}");
  fileUploadData.append("file_title1", file.name.split('.')[0]);
  fileUploadData.append("file_id", file_id.toString());  //minio resp
  fileUploadData.append("file_description", file.name);
  fileUploadData.append("file_size1", file.size.toString());
  fileUploadData.append("file_digiPath", "");
  fileUploadData.append("folder_session", "0");
  fileUploadData.append("lastModified", file.lastModified.toString());
  fileUploadData.append("folder_is_resource", "0");
  fileUploadData.append("folder_is_downloadale", "1");
  fileUploadData.append("resource_array", "[]");
  fileUploadData.append("downloadable_array", "[]");
  fileUploadData.append("new_folder_name", "");
  fileUploadData.append("folder_color", "");
  fileUploadData.append("replace_file", "0");
  fileUploadData.append("chooseFile1", '6352_' + file.name);
  const userToken = chrome.storage.sync.get(['userToken'], async function (items) {
    const fileUpload = await getUrl("https://apitest.digiboxx.com/dgb_asset_file_mgmt_func/dgb_user_file_upload_fn/", "POST", {
      // "Content-Type": "application/json",
      "accept": "application/json",
      'Authorization': `Bearer ${items.userToken}`,
      "x-request-referrer": "https://apitest.digiboxx.com/"
    },
      // JSON.stringify({
      //   tag_details1: '',
      //   user_details:'',
      //   file_title1: '',
      //   file_id:'',
      //   file_description: '',
      //   file_size1:file.size,
      //   file_digiPath: '',
      //   folder_session: '',
      //   lastModified :file.lastModified,
      //   folder_is_resource:0,
      //   folder_is_downloadale: '',
      //   resource_array: '',
      //   downloadable_array: [],
      //   new_folder_name: '',
      //   folder_color: '',
      //   replace_file: 0 ,
      //   chooseFile1:''
      // })
      fileUploadData
    );
    // message('Settings retrieved', items);
    console.log(fileUpload)
    // console.log(items)
    if (fileUpload.status === "success") {
      console.log("File uploaded successfully")
    }
  });
}



// console.log(`File size: ${sizeInBytes} bytes`);
// localStorage.setItem('sizeInBytes' , sizeInBytes)
// let reqhttp = new XMLHttpRequest()
// reqhttp.onreadystatechange = function () {
//   if (this.readyState == 4 && this.status == 200) {
//     // Typical action to be performed when the document is ready:
//     console.log(reqhttp.responseText)
//   }
// };
// reqhttp.open("POST", "https://apitest.digiboxx.com/dgb_user_func/dgb_check_user_limit_fn/", true);
// reqhttp.setRequestHeader("Content-Type", "application/json")
// reqhttp.setRequestHeader("accept", "application/json")
// reqhttp.setRequestHeader('Authorization', `Bearer ${userToken}`)
// reqhttp.setRequestHeader("x-request-referrer", "https://apitest.digiboxx.com/")
// reqhttp.send(JSON.stringify({
//   is_managed: "N",
// }));




