
FILES=index.html css js resources plakat.html
REMOTE=jonhaug@login.ifi.uio.no:www_docs/saltfjellet/


permission:
	chmod -R a+rX $(FILES)

deploy: permission
	rsync -avz -e ssh $(FILES) $(REMOTE)


