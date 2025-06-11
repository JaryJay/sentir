# You only need to run this file once

cd ./sentir-common
bun install
bun link
cd ..

bun --prefix ./sentir install
bun --prefix ./sentir-api install
