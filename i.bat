:: You only need to run this file once

cd ./sentir-common
bun install --peer
bun link
cd ..

pnpm --prefix ./sentir install
bun --prefix ./sentir-api install
