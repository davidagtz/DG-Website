function validate_and_submit(id) {
    let form = document.getElementById(id);
    let children = form.children;
    if (children[7].value != children[12].value) {
        document.getElementById("pc").innerHTML = "Passwords do not match";
        return false;
    }
    form.submit();
}