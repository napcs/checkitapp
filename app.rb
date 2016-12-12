require 'rubygems'
require 'sinatra'


# HTML5 cache-manifest has to be served using
# the proper MIME type. Sinatra makes this very easy.
get "/tasks.manifest" do
  headers 'Content-Type' => 'text/cache-manifest' # Must be served with this MIME type
  erb :manifest
end

# Default courtesy route
get "/" do
  redirect "/index.html"
end
  

