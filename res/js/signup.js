function validate_and_submit(id) {
    let form = document.getElementById(id);
    let children = form.children;
    console.log("DSA")
    if (children[7].value != children[12].value)
        return false;
    form.submit();
}