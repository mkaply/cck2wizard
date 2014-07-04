SHORTNAME=cck2wizard
export SHORTNAME=$SHORTNAME
rm  $SHORTNAME*.xpi
rm -rf $SHORTNAME
mkdir $SHORTNAME
cd $SHORTNAME
rsync -r --exclude=.svn --exclude-from=../excludefile.txt ../* .
VERSION=`grep "em:version" install.rdf | sed -e 's/[ \t]*<em:version>//;s/<\/em:version>//g'`
export VERSION=$VERSION
perl -pi -e 's/0.0.0/$ENV{"VERSION"}/gi' bootstrap*.js
rm bootstrap*.js.bak
zip -r -D ../$SHORTNAME-$VERSION.xpi *
zip -r -D ../$SHORTNAME-latest.xpi *
cd ..
rm -rf $SHORTNAME
#wget --post-file=$SHORTNAME-$VERSION.xpi http://localhost:8888/
