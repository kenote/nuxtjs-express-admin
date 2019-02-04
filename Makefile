
all: install

clear:
	@rm -rf .nuxt
	@rm -rf build
	@rm -rf node_modules

install:
	@npm set registry https://registry.npm.taobao.org
	@npm set sass_binary_site https://npm.taobao.org/mirrors/node-sass
	@npm install
	
update:
	@npm set registry https://registry.npm.taobao.org
	@npm set sass_binary_site https://npm.taobao.org/mirrors/node-sass
	@npm update