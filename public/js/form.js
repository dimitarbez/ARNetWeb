document.querySelector("#submit").disabled = true;

document.querySelector('.custom-file-input').addEventListener('change',function(e){
    var fileName = document.getElementById("file_to_upload").files[0].name;
    var nextSibling = e.target.nextElementSibling

    let extensionType = fileName.split(".").pop();
    if (extensionType != "glb") {
        //alert("Model must be of GLB or GLTF type!");
        document.querySelector("#file_to_upload").value = null;
        nextSibling.innerText = "Choose a 3D model with the GLB format!";
        document.querySelector("#submit").disabled = true;
    }
    else {
        nextSibling.innerText = fileName
        document.querySelector("#submit").disabled = false
    }
    console.log(extensionType);
})