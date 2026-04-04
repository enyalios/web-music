package music;
use Dancer2;
use File::Find;
use List::Util 'shuffle';

our $VERSION = '0.1';
my $music_path = "public/media";

sub escape_for_js {
    $_[0] =~ s/\\/\\\\/g;
    $_[0] =~ s/'/\\'/g;
    $_[0] =~ s/"/\\"/g;
    $_[0] =~ s/\n/\\n/g;
    $_[0] =~ s/\r/\\r/g;
}

get '/' => sub {
    my @songs;
    find(sub { push @songs, $File::Find::name if $_ !~ /\.(m3u|jpg)$/ && -f $_; }, $music_path);
    @songs = sort @songs;
    for(@songs) {
        s/^\Q$music_path\E\/?//;
        chomp;
        escape_for_js($_);
    }

    template 'index' => {
        songs   => \@songs,
        mapping => [ shuffle(0..@songs-1) ],
    };
};

true;
