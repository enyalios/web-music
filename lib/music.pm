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

sub coverart {
    my $path = $_[0];
    while($path =~ /^\Q$music_path\E/) {
        if(-e "$path/cover.jpg") {
            $path =~ s!^public/!!;
            return "$path/cover.jpg"
        }
        $path =~ s!/[^/]*$!!;
    }
    return "cover.jpg";
}

get '/meta' => sub {
    my $file = $music_path . "/" .query_parameters->get('file');
    return "Bad path." if $file =~ m!/\.\./!;
    open(my $fh, '-|', qw'ffprobe -v quiet -show_entries stream_tags:format_tags', $file)
        or die "Could not run ffprobe: $!";
    my %tag;
    while(<$fh>) {
        $tag{$1} = $2 if /^TAG:([^=]+)=(.*)$/;
    }
    $tag{cover} = coverart($file);
    return encode_json \%tag;
};

true;
