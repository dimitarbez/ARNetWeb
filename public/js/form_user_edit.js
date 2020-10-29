document.querySelector('#image_for_model').addEventListener('change',function(e){
    var fileName = document.getElementById("image_for_model").files[0].name;
    var nextSibling = e.target.nextElementSibling

    let extensionType = fileName.split(".").pop();
    if (extensionType != "jpg" && extensionType != "png" && extensionType != "jpeg") {
        //alert("Model must be of GLB or GLTF type!");
        document.querySelector("#image_for_model").value = null;
        nextSibling.innerText = "Use a correct image format!";
        document.querySelector("#submit").disabled = true;
        imageError = 1;
    }
    else {
        imageError = 0;
        nextSibling.innerText = fileName
        if (!imageError && !modelError) {
            document.querySelector("#submit").disabled = false
        }
    }
    console.log(extensionType);
});