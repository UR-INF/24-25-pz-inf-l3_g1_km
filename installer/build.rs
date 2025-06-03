fn main() {
    embed_resource::compile::<&str, &str, std::iter::Empty<&str>>("app.rc", std::iter::empty());
}